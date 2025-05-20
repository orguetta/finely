from rest_framework import generics, permissions, viewsets, status, filters
from rest_framework.pagination import PageNumberPagination
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework.decorators import action
from .models import (
    Budget, Category, Transaction, SubscriptionPlan, Subscription,
    AnalyticsReport, SavingsGoal, BillReminder, DebtAccount, DebtPayment,
    Investment, InvestmentValue
)
from django.core.validators import validate_email
from django.core.exceptions import ValidationError
from django.contrib.auth import get_user_model
from django.contrib.auth.password_validation import validate_password
from .serializers import (
    BudgetSerializer,
    CategorySerializer,
    TransactionSerializer,
    UserRegistrationSerializer,
    UserProfileSerializer,
    SubscriptionPlanSerializer,
    SubscriptionSerializer,
    AnalyticsReportSerializer,
    SavingsGoalSerializer,
    BillReminderSerializer,
    DebtAccountSerializer,
    InvestmentSerializer,
)
from django.utils import timezone
from datetime import timedelta
from decimal import Decimal


class CustomPagination(PageNumberPagination):
    page_size = 100


# CATEGORY VIEWSET
class CategoryViewSet(viewsets.ModelViewSet):
    serializer_class = CategorySerializer
    permission_classes = [permissions.IsAuthenticated]
    pagination_class = CustomPagination

    def get_queryset(self):
        return Category.objects.filter(
            user=self.request.user
        ) | Category.objects.filter(user__isnull=True)

    def perform_create(self, serializer):
        serializer.save(user=self.request.user)


# TRANSACTION VIEWSET
class TransactionViewSet(viewsets.ModelViewSet):
    serializer_class = TransactionSerializer
    permission_classes = [permissions.IsAuthenticated]
    pagination_class = CustomPagination

    def get_queryset(self):
        return Transaction.objects.filter(user=self.request.user)

    def perform_create(self, serializer):
        serializer.save(user=self.request.user)


# BUDGET VIEWSET
class BudgetViewSet(viewsets.ModelViewSet):
    serializer_class = BudgetSerializer
    permission_classes = [permissions.IsAuthenticated]
    pagination_class = CustomPagination

    def get_queryset(self):
        return Budget.objects.filter(user=self.request.user)

    def perform_create(self, serializer):
        serializer.save(user=self.request.user)
        
    def create(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        
        # If an existing budget was found in validation, update it
        if serializer.instance:
            serializer.update(serializer.instance, serializer.validated_data)
            return Response(serializer.data, status=status.HTTP_200_OK)
        
        # Otherwise create a new budget
        self.perform_create(serializer)
        headers = self.get_success_headers(serializer.data)
        return Response(serializer.data, status=status.HTTP_201_CREATED, headers=headers)


class RegisterUserAPIView(generics.CreateAPIView):
    serializer_class = UserRegistrationSerializer
    permission_classes = [AllowAny]

    def create(self, request, *args, **kwargs):
        # Get email from request data
        email = request.data.get("email")

        # Check if email is provided
        if not email:
            return Response(
                {"email": ["Email is required."]},
                status=status.HTTP_400_BAD_REQUEST,
            )

        # Validate email format
        try:
            validate_email(email)
        except ValidationError:
            return Response(
                {"email": ["Enter a valid email address."]},
                status=status.HTTP_400_BAD_REQUEST,
            )

        # Check if email already exists
        if get_user_model().objects.filter(email=email).exists():
            return Response(
                {
                    "email": [
                        "Something went wrong. Please contact support or try again."
                    ]
                },
                status=status.HTTP_400_BAD_REQUEST,
            )

        return super().create(request, *args, **kwargs)


class MeView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request):
        serializer = UserProfileSerializer(request.user)
        return Response(serializer.data)


class UpdateProfileView(generics.UpdateAPIView):
    serializer_class = UserProfileSerializer
    permission_classes = [IsAuthenticated]

    def get_object(self):
        return self.request.user


class ChangePasswordView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request):
        user = request.user
        current_password = request.data.get("current_password")
        new_password = request.data.get("new_password")
        confirm_password = request.data.get("confirm_password")

        if not current_password or not new_password or not confirm_password:
            return Response(
                {"error": "All password fields are required"},
                status=status.HTTP_400_BAD_REQUEST,
            )

        if not user.check_password(current_password):
            return Response(
                {"error": "Current password is incorrect"},
                status=status.HTTP_400_BAD_REQUEST,
            )

        if new_password != confirm_password:
            return Response(
                {"error": "New passwords do not match"},
                status=status.HTTP_400_BAD_REQUEST,
            )

        try:
            validate_password(new_password, user)
        except ValidationError as e:
            return Response({"error": list(e)}, status=status.HTTP_400_BAD_REQUEST)

        user.set_password(new_password)
        user.save()
        return Response(
            {"message": "Password updated successfully"}, status=status.HTTP_200_OK
        )


class SubscriptionPlanViewSet(viewsets.ModelViewSet):
    queryset = SubscriptionPlan.objects.all()
    serializer_class = SubscriptionPlanSerializer
    permission_classes = [permissions.IsAuthenticated]
    filter_backends = [filters.SearchFilter, filters.OrderingFilter]
    search_fields = ['name', 'type', 'description']
    ordering_fields = ['name', 'type', 'created_at']


class SubscriptionViewSet(viewsets.ModelViewSet):
    serializer_class = SubscriptionSerializer
    permission_classes = [permissions.IsAuthenticated]
    filter_backends = [filters.SearchFilter, filters.OrderingFilter]
    search_fields = ['plan__name', 'status', 'notes']
    ordering_fields = ['start_date', 'end_date', 'amount', 'created_at']

    def get_queryset(self):
        return Subscription.objects.filter(user=self.request.user)

    def perform_create(self, serializer):
        serializer.save(user=self.request.user)

    @action(detail=False, methods=['get'])
    def upcoming_renewals(self, request):
        """Get subscriptions that are due for renewal in the next 30 days"""
        thirty_days_from_now = timezone.now().date() + timedelta(days=30)
        subscriptions = self.get_queryset().filter(
            status='active',
            next_billing_date__lte=thirty_days_from_now
        ).order_by('next_billing_date')
        serializer = self.get_serializer(subscriptions, many=True)
        return Response(serializer.data)

    @action(detail=False, methods=['get'])
    def statistics(self, request):
        """Get subscription statistics"""
        queryset = self.get_queryset()
        total_active = queryset.filter(status='active').count()
        total_amount = sum(sub.amount for sub in queryset.filter(status='active'))
        by_type = {}
        for sub in queryset.filter(status='active'):
            plan_type = sub.plan.type
            if plan_type not in by_type:
                by_type[plan_type] = {
                    'count': 0,
                    'total_amount': 0
                }
            by_type[plan_type]['count'] += 1
            by_type[plan_type]['total_amount'] += float(sub.amount)

        return Response({
            'total_active_subscriptions': total_active,
            'total_monthly_amount': total_amount,
            'by_type': by_type
        })


class AnalyticsReportViewSet(viewsets.ModelViewSet):
    serializer_class = AnalyticsReportSerializer
    permission_classes = [permissions.IsAuthenticated]
    pagination_class = CustomPagination

    def get_queryset(self):
        return AnalyticsReport.objects.filter(user=self.request.user)

    def perform_create(self, serializer):
        serializer.save(user=self.request.user)

    @action(detail=False, methods=['get'])
    def monthly_summary(self, request):
        today = timezone.now().date()
        start_date = today.replace(day=1)
        end_date = (start_date + timedelta(days=32)).replace(day=1) - timedelta(days=1)
        
        report = AnalyticsReport.objects.create(
            user=request.user,
            start_date=start_date,
            end_date=end_date,
            report_type='monthly',
            data=self._generate_monthly_summary(start_date, end_date)
        )
        serializer = self.get_serializer(report)
        return Response(serializer.data)

    def _generate_monthly_summary(self, start_date, end_date):
        transactions = Transaction.objects.filter(
            user=self.request.user,
            transaction_date__range=[start_date, end_date]
        )
        
        summary = {
            'total_income': str(sum(t.amount for t in transactions if t.type == 'income')),
            'total_expenses': str(sum(t.amount for t in transactions if t.type == 'expense')),
            'by_category': {}
        }
        
        for transaction in transactions:
            category_name = transaction.category.name if transaction.category else 'Uncategorized'
            if category_name not in summary['by_category']:
                summary['by_category'][category_name] = {'income': '0', 'expense': '0'}
            summary['by_category'][category_name][transaction.type] = str(
                Decimal(summary['by_category'][category_name][transaction.type]) + transaction.amount
            )
        
        return summary


class SavingsGoalViewSet(viewsets.ModelViewSet):
    serializer_class = SavingsGoalSerializer
    permission_classes = [permissions.IsAuthenticated]
    pagination_class = CustomPagination
    filter_backends = [filters.SearchFilter, filters.OrderingFilter]
    search_fields = ['title', 'status']
    ordering_fields = ['target_date', 'created_at', 'current_amount', 'target_amount']

    def get_queryset(self):
        return SavingsGoal.objects.filter(user=self.request.user)

    def perform_create(self, serializer):
        serializer.save(user=self.request.user)

    @action(detail=True, methods=['post'])
    def update_progress(self, request, pk=None):
        goal = self.get_object()
        amount = Decimal(request.data.get('amount', 0))
        
        if amount <= 0:
            return Response(
                {'error': 'Amount must be greater than zero'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        goal.current_amount += amount
        if goal.current_amount >= goal.target_amount:
            goal.status = 'completed'
        goal.save()
        
        serializer = self.get_serializer(goal)
        return Response(serializer.data)


class BillReminderViewSet(viewsets.ModelViewSet):
    serializer_class = BillReminderSerializer
    permission_classes = [permissions.IsAuthenticated]
    pagination_class = CustomPagination
    filter_backends = [filters.SearchFilter, filters.OrderingFilter]
    search_fields = ['title', 'status']
    ordering_fields = ['due_date', 'created_at', 'amount']

    def get_queryset(self):
        return BillReminder.objects.filter(user=self.request.user)

    def perform_create(self, serializer):
        serializer.save(user=self.request.user)

    @action(detail=False, methods=['get'])
    def upcoming(self, request):
        today = timezone.now().date()
        next_week = today + timedelta(days=7)
        upcoming = self.get_queryset().filter(
            due_date__range=[today, next_week],
            status='pending'
        )
        serializer = self.get_serializer(upcoming, many=True)
        return Response(serializer.data)

    @action(detail=True, methods=['post'])
    def mark_paid(self, request, pk=None):
        reminder = self.get_object()
        reminder.status = 'paid'
        reminder.save()
        
        # Create a transaction for this payment
        transaction = Transaction.objects.create(
            user=request.user,
            title=f"Payment for {reminder.title}",
            amount=reminder.amount,
            type='expense',
            transaction_date=timezone.now().date()
        )
        
        serializer = self.get_serializer(reminder)
        return Response(serializer.data)


class DebtAccountViewSet(viewsets.ModelViewSet):
    serializer_class = DebtAccountSerializer
    permission_classes = [permissions.IsAuthenticated]
    pagination_class = CustomPagination
    filter_backends = [filters.SearchFilter, filters.OrderingFilter]
    search_fields = ['name', 'account_type', 'status']
    ordering_fields = ['due_date', 'balance', 'created_at']

    def get_queryset(self):
        return DebtAccount.objects.filter(user=self.request.user)

    def perform_create(self, serializer):
        serializer.save(user=self.request.user)

    @action(detail=True, methods=['post'])
    def record_payment(self, request, pk=None):
        debt_account = self.get_object()
        amount = Decimal(request.data.get('amount', 0))
        
        if amount <= 0:
            return Response(
                {'error': 'Payment amount must be greater than zero'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        # Create the payment record
        payment = DebtPayment.objects.create(
            debt_account=debt_account,
            amount=amount,
            payment_date=timezone.now().date(),
            notes=request.data.get('notes', '')
        )
        
        # Create a transaction for this payment
        transaction = Transaction.objects.create(
            user=request.user,
            title=f"Payment for {debt_account.name}",
            amount=amount,
            type='expense',
            transaction_date=payment.payment_date
        )
        
        # Link the transaction to the payment
        payment.transaction = transaction
        payment.save()
        
        # Update the debt account balance
        debt_account.balance -= amount
        if debt_account.balance <= 0:
            debt_account.status = 'paid_off'
        debt_account.save()
        
        serializer = self.get_serializer(debt_account)
        return Response(serializer.data)


class InvestmentViewSet(viewsets.ModelViewSet):
    serializer_class = InvestmentSerializer
    permission_classes = [permissions.IsAuthenticated]
    pagination_class = CustomPagination
    filter_backends = [filters.SearchFilter, filters.OrderingFilter]
    search_fields = ['name', 'symbol', 'type']
    ordering_fields = ['purchase_date', 'created_at', 'purchase_price']

    def get_queryset(self):
        return Investment.objects.filter(user=self.request.user)

    def perform_create(self, serializer):
        investment = serializer.save(user=self.request.user)
        
        # Record initial value
        InvestmentValue.objects.create(
            investment=investment,
            date=investment.purchase_date,
            value=investment.purchase_price * investment.quantity
        )

    @action(detail=True, methods=['post'])
    def update_value(self, request, pk=None):
        investment = self.get_object()
        value = Decimal(request.data.get('value', 0))
        date = request.data.get('date', timezone.now().date())
        
        if value < 0:
            return Response(
                {'error': 'Value cannot be negative'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        # Record new value
        InvestmentValue.objects.create(
            investment=investment,
            date=date,
            value=value
        )
        
        serializer = self.get_serializer(investment)
        return Response(serializer.data)

    @action(detail=False, methods=['get'])
    def portfolio_summary(self, request):
        investments = self.get_queryset()
        total_invested = sum(i.purchase_price * i.quantity for i in investments)
        current_value = sum(
            i.values.first().value if i.values.exists() else i.purchase_price * i.quantity
            for i in investments
        )
        
        return Response({
            'total_invested': str(total_invested),
            'current_value': str(current_value),
            'total_gain_loss': str(current_value - total_invested),
            'gain_loss_percentage': str((current_value - total_invested) / total_invested * 100 if total_invested > 0 else 0)
        })

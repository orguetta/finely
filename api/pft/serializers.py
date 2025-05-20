from django.contrib.auth import get_user_model
from rest_framework import serializers
from .models import (
    Transaction, Category, Budget, SubscriptionPlan, Subscription,
    AnalyticsReport, SavingsGoal, BillReminder, DebtAccount, DebtPayment,
    Investment, InvestmentValue
)

User = get_user_model()


class UserProfileSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = (
            "id",
            "email",
            "first_name",
            "last_name",
            "phone_number",
            "location",
            "bio",
            "department",
            "role",
        )
        read_only_fields = ("email", "role")


class UserRegistrationSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True, required=True)
    confirm_password = serializers.CharField(write_only=True, required=True)
    username = serializers.CharField(required=False)

    class Meta:
        model = User
        fields = (
            "email",
            "username",
            "password",
            "confirm_password",
            "first_name",
            "last_name",
            "phone_number",
            "location",
            "bio",
            "department",
        )

    def validate(self, data):
        if data["password"] != data.pop("confirm_password"):
            raise serializers.ValidationError("Passwords do not match.")
        if len(data["password"]) < 8:
            raise serializers.ValidationError(
                "Password must be at least 8 characters long."
            )
        data["username"] = data["email"]  # Set username same as email
        return data

    def create(self, validated_data):
        return User.objects.create_user(**validated_data)


class CategorySerializer(serializers.ModelSerializer):
    def validate_name(self, value):
        user = self.context["request"].user
        # Check if category with same name exists for this user
        if Category.objects.filter(user=user, name=value).exists():
            raise serializers.ValidationError(
                "A category with this name already exists."
            )
        return value

    class Meta:
        model = Category
        fields = "__all__"
        read_only_fields = ["user"]


class TransactionSerializer(serializers.ModelSerializer):
    amount = serializers.DecimalField(max_digits=12, decimal_places=2)

    class Meta:
        model = Transaction
        fields = ['id', 'user', 'title', 'amount', 'type', 'category', 
                 'transaction_date', 'created_at', 'updated_at']
        read_only_fields = ['created_at', 'updated_at']

    def to_representation(self, instance):
        # Ensure amount is always serialized as Decimal
        ret = super().to_representation(instance)
        ret['amount'] = str(instance.amount)
        return ret

    def create(self, validated_data):
        # Handle the amount encryption during creation
        amount = validated_data.pop('amount', None)
        transaction = Transaction(**validated_data)
        if amount is not None:
            transaction.amount = str(amount)
        transaction.save()
        return transaction

    def update(self, instance, validated_data):
        # Handle the amount encryption during update
        amount = validated_data.pop('amount', None)
        for attr, value in validated_data.items():
            setattr(instance, attr, value)
        if amount is not None:
            instance.amount = str(amount)
        instance.save()
        return instance


class BudgetSerializer(serializers.ModelSerializer):
    def validate(self, data):
        user = self.context["request"].user
        # Check if budget already exists for this user, category, month, and year
        try:
            existing_budget = Budget.objects.get(
                user=user,
                category=data["category"],
                month=data["month"],
                year=data["year"],
            )
            
            # If this is an update operation for this exact budget, allow it
            if self.instance and self.instance.id == existing_budget.id:
                return data
                
            # For POST requests, update the existing budget instead of creating a new one
            if not self.instance:
                self.instance = existing_budget
                
            return data
        except Budget.DoesNotExist:
            # No existing budget, so we can create a new one
            return data

    class Meta:
        model = Budget
        fields = "__all__"
        read_only_fields = ["user"]


class SubscriptionPlanSerializer(serializers.ModelSerializer):
    class Meta:
        model = SubscriptionPlan
        fields = '__all__'

class SubscriptionSerializer(serializers.ModelSerializer):
    plan_details = SubscriptionPlanSerializer(source='plan', read_only=True)
    user_email = serializers.EmailField(source='user.email', read_only=True)

    class Meta:
        model = Subscription
        fields = [
            'id',
            'user',
            'user_email',
            'plan',
            'plan_details',
            'amount',
            'start_date',
            'end_date',
            'auto_renewal',
            'status',
            'next_billing_date',
            'notes',
            'created_at',
            'updated_at'
        ]
        read_only_fields = ['created_at', 'updated_at']

    def validate(self, data):
        if data.get('end_date') and data['start_date'] > data['end_date']:
            raise serializers.ValidationError("End date must be after start date")
        return data


class AnalyticsReportSerializer(serializers.ModelSerializer):
    user_email = serializers.EmailField(source='user.email', read_only=True)

    class Meta:
        model = AnalyticsReport
        fields = ['id', 'user', 'user_email', 'start_date', 'end_date', 
                 'report_type', 'data', 'created_at']
        read_only_fields = ['created_at']

    def validate(self, data):
        if data['start_date'] > data['end_date']:
            raise serializers.ValidationError("End date must be after start date")
        return data


class SavingsGoalSerializer(serializers.ModelSerializer):
    user_email = serializers.EmailField(source='user.email', read_only=True)
    progress_percentage = serializers.FloatField(read_only=True)

    class Meta:
        model = SavingsGoal
        fields = ['id', 'user', 'user_email', 'title', 'target_amount', 
                 'current_amount', 'target_date', 'status', 'progress_percentage',
                 'created_at', 'updated_at']
        read_only_fields = ['created_at', 'updated_at']

    def validate(self, data):
        if 'target_amount' in data and data['target_amount'] <= 0:
            raise serializers.ValidationError("Target amount must be greater than zero")
        if 'current_amount' in data and data['current_amount'] < 0:
            raise serializers.ValidationError("Current amount cannot be negative")
        return data


class BillReminderSerializer(serializers.ModelSerializer):
    user_email = serializers.EmailField(source='user.email', read_only=True)

    class Meta:
        model = BillReminder
        fields = ['id', 'user', 'user_email', 'title', 'amount', 'due_date',
                 'recurrence', 'status', 'notification_sent', 'created_at', 'updated_at']
        read_only_fields = ['created_at', 'updated_at', 'notification_sent']

    def validate(self, data):
        if data.get('amount', 0) <= 0:
            raise serializers.ValidationError("Amount must be greater than zero")
        return data


class DebtPaymentSerializer(serializers.ModelSerializer):
    transaction_details = TransactionSerializer(source='transaction', read_only=True)

    class Meta:
        model = DebtPayment
        fields = ['id', 'debt_account', 'amount', 'payment_date', 
                 'transaction', 'transaction_details', 'notes', 'created_at']
        read_only_fields = ['created_at']

    def validate_amount(self, value):
        if value <= 0:
            raise serializers.ValidationError("Payment amount must be greater than zero")
        return value


class DebtAccountSerializer(serializers.ModelSerializer):
    user_email = serializers.EmailField(source='user.email', read_only=True)
    payments = DebtPaymentSerializer(many=True, read_only=True)

    class Meta:
        model = DebtAccount
        fields = ['id', 'user', 'user_email', 'name', 'balance', 'interest_rate',
                 'minimum_payment', 'due_date', 'account_type', 'status', 
                 'payments', 'created_at', 'updated_at']
        read_only_fields = ['created_at', 'updated_at']

    def validate(self, data):
        if data.get('balance', 0) < 0:
            raise serializers.ValidationError("Balance cannot be negative")
        if data.get('interest_rate', 0) < 0:
            raise serializers.ValidationError("Interest rate cannot be negative")
        if data.get('minimum_payment', 0) <= 0:
            raise serializers.ValidationError("Minimum payment must be greater than zero")
        return data


class InvestmentValueSerializer(serializers.ModelSerializer):
    class Meta:
        model = InvestmentValue
        fields = ['id', 'date', 'value', 'created_at']
        read_only_fields = ['created_at']

    def validate_value(self, value):
        if value < 0:
            raise serializers.ValidationError("Investment value cannot be negative")
        return value


class InvestmentSerializer(serializers.ModelSerializer):
    user_email = serializers.EmailField(source='user.email', read_only=True)
    values = InvestmentValueSerializer(many=True, read_only=True)
    current_value = serializers.SerializerMethodField()

    class Meta:
        model = Investment
        fields = ['id', 'user', 'user_email', 'name', 'symbol', 'type',
                 'purchase_price', 'quantity', 'purchase_date', 'notes',
                 'values', 'current_value', 'created_at', 'updated_at']
        read_only_fields = ['created_at', 'updated_at']

    def get_current_value(self, obj):
        latest_value = obj.values.first()
        return latest_value.value if latest_value else None

    def validate(self, data):
        if data.get('purchase_price', 0) <= 0:
            raise serializers.ValidationError("Purchase price must be greater than zero")
        if data.get('quantity', 0) <= 0:
            raise serializers.ValidationError("Quantity must be greater than zero")
        return data

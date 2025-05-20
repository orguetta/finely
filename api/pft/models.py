from django.db import models
from django.contrib.auth.models import AbstractUser
from django.contrib.auth.base_user import BaseUserManager



class CustomUserManager(BaseUserManager):
    def create_user(self, email, password=None, **extra_fields):
        if not email:
            raise ValueError('The Email field must be set')
        email = self.normalize_email(email)
        user = self.model(email=email, **extra_fields)
        if password:
            user.set_password(password)
        user.save(using=self._db)
        return user

    def create_superuser(self, email, password=None, **extra_fields):
        extra_fields.setdefault('is_staff', True)
        extra_fields.setdefault('is_superuser', True)
        return self.create_user(email, password, **extra_fields)


class User(AbstractUser):
    # Override the groups field with a unique related_name
    groups = models.ManyToManyField(
        'auth.Group',
        related_name='pft_user_set',
        blank=True,
        help_text='The groups this user belongs to.',
        verbose_name='groups',
    )
    # Override the user_permissions field with a unique related_name
    user_permissions = models.ManyToManyField(
        'auth.Permission',
        related_name='pft_user_set',
        blank=True,
        help_text='Specific permissions for this user.',
        verbose_name='user permissions',
    )

    DEPARTMENT_CHOICES = (
        ('engineering', 'Engineering'),
        ('finance', 'Finance'),
        ('hr', 'HR'),
        ('marketing', 'Marketing'),
        ('sales', 'Sales'),
        ('other', 'Other'),
    )
    
    ROLE_CHOICES = (
        ('admin', 'Admin'),
        ('manager', 'Manager'),
        ('employee', 'Employee'),
    )

    email = models.EmailField(unique=True)
    phone_number = models.CharField(max_length=20, blank=True)
    location = models.CharField(max_length=100, blank=True)
    bio = models.TextField(blank=True)
    department = models.CharField(max_length=20, choices=DEPARTMENT_CHOICES, default='other')
    role = models.CharField(max_length=20, choices=ROLE_CHOICES, default='employee')

    objects = CustomUserManager()

    USERNAME_FIELD = 'email'
    REQUIRED_FIELDS = []

    def __str__(self):
        return self.email


# CATEGORY MODEL
class Category(models.Model):
    TYPE_CHOICES = (
        ("income", "Income"),
        ("expense", "Expense"),
    )

    name = models.CharField(max_length=100)
    type = models.CharField(max_length=10, choices=TYPE_CHOICES)
    user = models.ForeignKey(User, on_delete=models.CASCADE, null=True, blank=True)

    def __str__(self):
        return f"{self.name} ({self.type})"


# TRANSACTION MODEL
class Transaction(models.Model):
    TYPE_CHOICES = (
        ("income", "Income"),
        ("expense", "Expense"),
    )

    user = models.ForeignKey(
        User, on_delete=models.CASCADE, related_name="transactions"
    )
    title = models.CharField(max_length=255)
    amount = models.DecimalField(max_digits=12, decimal_places=2)
    type = models.CharField(max_length=10, choices=TYPE_CHOICES)
    category = models.ForeignKey(
        Category, on_delete=models.SET_NULL, null=True, related_name="transactions"
    )
    transaction_date = models.DateField()
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return f"{self.title} - {self.amount} ({self.type})"


# BUDGET MODEL (Optional Feature)
class Budget(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name="budgets")
    category = models.ForeignKey(
        Category, on_delete=models.CASCADE, related_name="budgets"
    )
    month = models.PositiveSmallIntegerField()  # 1 to 12
    year = models.PositiveIntegerField()
    amount_limit = models.DecimalField(max_digits=12, decimal_places=2)

    class Meta:
        unique_together = ("user", "category", "month", "year")  # prevent duplicates

    def __str__(self):
        return f"{self.user.username} - {self.category.name} - {self.month}/{self.year}"


class SubscriptionPlan(models.Model):
    BILLING_CYCLE_CHOICES = (
        ('monthly', 'Monthly'),
        ('quarterly', 'Quarterly'),
        ('yearly', 'Yearly'),
        ('custom', 'Custom'),
    )

    TYPE_CHOICES = (
        ('ott', 'OTT Platform'),
        ('product', 'Product'),
        ('tool', 'Tool'),
        ('other', 'Other'),
    )

    name = models.CharField(max_length=100)
    description = models.TextField(blank=True)
    type = models.CharField(max_length=20, choices=TYPE_CHOICES, default='other')
    billing_cycle = models.CharField(max_length=20, choices=BILLING_CYCLE_CHOICES, default='monthly')
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return f"{self.name} ({self.get_type_display()})"

class Subscription(models.Model):
    STATUS_CHOICES = (
        ('active', 'Active'),
        ('cancelled', 'Cancelled'),
        ('expired', 'Expired'),
        ('on_hold', 'On Hold'),
    )

    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='subscriptions')
    plan = models.ForeignKey(SubscriptionPlan, on_delete=models.CASCADE)
    amount = models.DecimalField(max_digits=10, decimal_places=2)
    start_date = models.DateField()
    end_date = models.DateField(null=True, blank=True)
    auto_renewal = models.BooleanField(default=True)
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='active')
    next_billing_date = models.DateField(null=True, blank=True)
    notes = models.TextField(blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return f"{self.user.email}'s {self.plan.name} subscription"

    class Meta:
        ordering = ['-created_at']


class AnalyticsReport(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='analytics_reports')
    start_date = models.DateField()
    end_date = models.DateField()
    report_type = models.CharField(max_length=20, choices=[
        ('monthly', 'Monthly Summary'),
        ('category', 'Category Analysis'),
        ('trend', 'Spending Trends')
    ])
    data = models.JSONField()
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['-created_at']

    def __str__(self):
        return f"{self.user.email}'s {self.get_report_type_display()} ({self.start_date} to {self.end_date})"


class SavingsGoal(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='savings_goals')
    title = models.CharField(max_length=100)
    target_amount = models.DecimalField(max_digits=12, decimal_places=2)
    current_amount = models.DecimalField(max_digits=12, decimal_places=2, default=0)
    target_date = models.DateField()
    status = models.CharField(max_length=20, choices=[
        ('active', 'Active'),
        ('completed', 'Completed'),
        ('abandoned', 'Abandoned')
    ], default='active')
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ['-created_at']

    def __str__(self):
        return f"{self.user.email}'s goal: {self.title}"

    @property
    def progress_percentage(self):
        return (self.current_amount / self.target_amount) * 100 if self.target_amount > 0 else 0


class BillReminder(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='bill_reminders')
    title = models.CharField(max_length=100)
    amount = models.DecimalField(max_digits=12, decimal_places=2)
    due_date = models.DateField()
    recurrence = models.CharField(max_length=20, choices=[
        ('once', 'One-time'),
        ('weekly', 'Weekly'),
        ('monthly', 'Monthly'),
        ('yearly', 'Yearly')
    ])
    status = models.CharField(max_length=20, choices=[
        ('pending', 'Pending'),
        ('paid', 'Paid'),
        ('overdue', 'Overdue')
    ], default='pending')
    notification_sent = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ['due_date']

    def __str__(self):
        return f"{self.user.email}'s bill: {self.title}"


class DebtAccount(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='debt_accounts')
    name = models.CharField(max_length=100)
    balance = models.DecimalField(max_digits=12, decimal_places=2)
    interest_rate = models.DecimalField(max_digits=5, decimal_places=2)
    minimum_payment = models.DecimalField(max_digits=12, decimal_places=2)
    due_date = models.DateField()
    account_type = models.CharField(max_length=20, choices=[
        ('credit_card', 'Credit Card'),
        ('loan', 'Loan'),
        ('mortgage', 'Mortgage')
    ])
    status = models.CharField(max_length=20, choices=[
        ('active', 'Active'),
        ('paid_off', 'Paid Off'),
        ('defaulted', 'Defaulted')
    ], default='active')
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ['due_date']

    def __str__(self):
        return f"{self.user.email}'s {self.get_account_type_display()}: {self.name}"


class DebtPayment(models.Model):
    debt_account = models.ForeignKey(DebtAccount, on_delete=models.CASCADE, related_name='payments')
    amount = models.DecimalField(max_digits=12, decimal_places=2)
    payment_date = models.DateField()
    transaction = models.ForeignKey(Transaction, on_delete=models.SET_NULL, null=True, blank=True)
    notes = models.TextField(blank=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['-payment_date']

    def __str__(self):
        return f"Payment of {self.amount} for {self.debt_account.name}"


class Investment(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='investments')
    name = models.CharField(max_length=100)
    symbol = models.CharField(max_length=10, blank=True)
    type = models.CharField(max_length=20, choices=[
        ('stocks', 'Stocks'),
        ('mutual_funds', 'Mutual Funds'),
        ('crypto', 'Cryptocurrency'),
        ('bonds', 'Bonds'),
        ('real_estate', 'Real Estate'),
        ('other', 'Other')
    ])
    purchase_price = models.DecimalField(max_digits=12, decimal_places=2)
    quantity = models.DecimalField(max_digits=12, decimal_places=4)
    purchase_date = models.DateField()
    notes = models.TextField(blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ['-created_at']

    def __str__(self):
        return f"{self.user.email}'s investment: {self.name}"


class InvestmentValue(models.Model):
    investment = models.ForeignKey(Investment, on_delete=models.CASCADE, related_name='values')
    date = models.DateField()
    value = models.DecimalField(max_digits=12, decimal_places=2)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['-date']
        get_latest_by = 'date'

    def __str__(self):
        return f"{self.investment.name} value on {self.date}"

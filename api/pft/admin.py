from django import forms
from django.contrib import admin
from django.contrib.auth.admin import UserAdmin as BaseUserAdmin
from .models import (
    Category, Subscription, SubscriptionPlan, Transaction, Budget, User,
    AnalyticsReport, SavingsGoal, BillReminder, DebtAccount, DebtPayment,
    Investment, InvestmentValue
)

class TransactionAdminForm(forms.ModelForm):
    amount = forms.DecimalField(max_digits=12, decimal_places=2)

    class Meta:
        model = Transaction
        fields = '__all__'

    def __init__(self, *args, **kwargs):
        super().__init__(*args, **kwargs)
        if self.instance and self.instance.pk:
            self.fields['amount'].initial = self.instance.amount

    def save(self, commit=True):
        instance = super().save(commit=False)
        amount = self.cleaned_data.get('amount')
        if amount is not None:
            instance.amount = str(amount)
        if commit:
            instance.save()
        return instance

@admin.register(User)
class UserAdmin(BaseUserAdmin):
    """Custom User admin"""
    list_display = ('email', 'first_name', 'last_name', 'phone_number', 'department', 'role', 'is_staff')
    search_fields = ('email', 'first_name', 'last_name', 'phone_number')
    ordering = ('email',)
    
    fieldsets = (
        (None, {'fields': ('email', 'password')}),
        ('Personal info', {'fields': ('first_name', 'last_name', 'phone_number', 'location', 'bio')}),
        ('Organization', {'fields': ('department', 'role')}),
        ('Permissions', {'fields': ('is_active', 'is_staff', 'is_superuser', 'groups', 'user_permissions')}),
        ('Important dates', {'fields': ('last_login', 'date_joined')}),
    )
    
    add_fieldsets = (
        (None, {
            'classes': ('wide',),
            'fields': ('email', 'password1', 'password2', 'department', 'role'),
        }),
    )

@admin.register(Transaction)
class TransactionAdmin(admin.ModelAdmin):
    form = TransactionAdminForm
    list_display = ('title', 'amount', 'type', 'user', 'category', 'transaction_date')
    search_fields = ('title', 'user__email')
    list_filter = ('type', 'category', 'user')

@admin.register(AnalyticsReport)
class AnalyticsReportAdmin(admin.ModelAdmin):
    list_display = ('user', 'report_type', 'start_date', 'end_date', 'created_at')
    list_filter = ('report_type', 'user')
    search_fields = ('user__email',)
    readonly_fields = ('created_at',)


@admin.register(SavingsGoal)
class SavingsGoalAdmin(admin.ModelAdmin):
    list_display = ('title', 'user', 'target_amount', 'current_amount', 'target_date', 'status')
    list_filter = ('status', 'user')
    search_fields = ('title', 'user__email')
    readonly_fields = ('created_at', 'updated_at')


@admin.register(BillReminder)
class BillReminderAdmin(admin.ModelAdmin):
    list_display = ('title', 'user', 'amount', 'due_date', 'recurrence', 'status')
    list_filter = ('status', 'recurrence', 'user')
    search_fields = ('title', 'user__email')
    readonly_fields = ('created_at', 'updated_at', 'notification_sent')


class DebtPaymentInline(admin.TabularInline):
    model = DebtPayment
    extra = 1
    readonly_fields = ('created_at',)


@admin.register(DebtAccount)
class DebtAccountAdmin(admin.ModelAdmin):
    list_display = ('name', 'user', 'balance', 'interest_rate', 'account_type', 'status', 'due_date')
    list_filter = ('account_type', 'status', 'user')
    search_fields = ('name', 'user__email')
    readonly_fields = ('created_at', 'updated_at')
    inlines = [DebtPaymentInline]


class InvestmentValueInline(admin.TabularInline):
    model = InvestmentValue
    extra = 1
    readonly_fields = ('created_at',)


@admin.register(Investment)
class InvestmentAdmin(admin.ModelAdmin):
    list_display = ('name', 'user', 'symbol', 'type', 'purchase_price', 'quantity', 'purchase_date')
    list_filter = ('type', 'user')
    search_fields = ('name', 'symbol', 'user__email')
    readonly_fields = ('created_at', 'updated_at')
    inlines = [InvestmentValueInline]

admin.site.register(Category)
admin.site.register(Budget)
admin.site.register(Subscription)
admin.site.register(SubscriptionPlan)

admin.site.site_header = "FinTrack Admin"
admin.site.site_title = "FinTrack Admin Portal"
admin.site.index_title = "Welcome to FinTrack Financial Management Portal"

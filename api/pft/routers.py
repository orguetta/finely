from rest_framework.routers import DefaultRouter
from .views import (
    CategoryViewSet, SubscriptionPlanViewSet, SubscriptionViewSet, TransactionViewSet, BudgetViewSet,
    AnalyticsReportViewSet, SavingsGoalViewSet, BillReminderViewSet, DebtAccountViewSet, InvestmentViewSet
)

router = DefaultRouter()
router.register("transactions", TransactionViewSet, basename="transaction")
router.register("categories", CategoryViewSet, basename="category")
router.register("budgets", BudgetViewSet, basename="budget")
router.register("subscriptions", SubscriptionViewSet, basename="subscription")
router.register("subscriptionPlans", SubscriptionPlanViewSet, basename="subscriptionPlan")
router.register("analytics", AnalyticsReportViewSet, basename="analytics")
router.register("savings-goals", SavingsGoalViewSet, basename="savings-goal")
router.register("bill-reminders", BillReminderViewSet, basename="bill-reminder")
router.register("debt-accounts", DebtAccountViewSet, basename="debt-account")
router.register("investments", InvestmentViewSet, basename="investment")

urlpatterns = router.urls

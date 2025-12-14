from django.db import models
from django.contrib.auth import get_user_model
from django.utils.translation import gettext_lazy as _

# Import Book from the shop app if needed
# from shop.models import Book 

User = get_user_model()

class Event(models.Model):
    title = models.CharField(max_length=255)
    description = models.TextField()
    date_time = models.DateTimeField()
    location = models.CharField(max_length=255)
    capacity = models.IntegerField(default=0, help_text=_("Maximum number of attendees. 0 for unlimited."))
    is_public = models.BooleanField(default=True)
    # Example link to the Book model (requires 'shop.Book' import)
    # related_book = models.ForeignKey(Book, on_delete=models.SET_NULL, null=True, blank=True)

    class Meta:
        verbose_name = _("Event")
        verbose_name_plural = _("Events")
        ordering = ['date_time']

    def __str__(self):
        return f"{self.title} on {self.date_time.strftime('%Y-%m-%d %H:%M')}"

    # Property to easily check remaining slots
    @property
    def remaining_capacity(self):
        if self.capacity == 0:
            return float('inf') # Unlimited
        return self.capacity - self.attendees.count()

    image = models.ImageField(
        upload_to="events/",
        null=True,
        blank=True
    )

class EventRegistration(models.Model):
    """
    The intermediate model that represents a user signing up for an event.
    """
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='event_registrations')
    event = models.ForeignKey(Event, on_delete=models.CASCADE, related_name='attendees')
    registered_at = models.DateTimeField(auto_now_add=True)
    
    class Meta:
        verbose_name = _("Event Registration")
        verbose_name_plural = _("Event Registrations")
        # Constraint to prevent double-booking
        unique_together = ('user', 'event')
        
    def __str__(self):
        return f"{self.user.username} registered for {self.event.title}"
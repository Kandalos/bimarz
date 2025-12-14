from rest_framework import serializers
from .models import Event, EventRegistration

class EventSerializer(serializers.ModelSerializer):
    # remaining_capacity is a read-only field calculated in the model
    remaining_capacity = serializers.ReadOnlyField() 
    image = serializers.ImageField(required=False)

    
    class Meta:
        model = Event
        fields = '__all__'
        read_only_fields = ['remaining_capacity']
        

class EventRegistrationSerializer(serializers.ModelSerializer):
    user_username = serializers.CharField(source='user.username', read_only=True)
    event_title = serializers.CharField(source='event.title', read_only=True)

    class Meta:
        model = EventRegistration
        # When registering, the frontend sends only the 'event' ID
        fields = ['id', 'user', 'event', 'registered_at', 'user_username', 'event_title']
        read_only_fields = ['user'] # User is set automatically by the view
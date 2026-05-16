from rest_framework import serializers
from django.contrib.auth import get_user_model
from django.contrib.auth.password_validation import validate_password

User = get_user_model()


class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ['id', 'name', 'email', 'avatar_color', 'date_joined']
        read_only_fields = ['id', 'date_joined']


class SignupSerializer(serializers.ModelSerializer):
    password = serializers.CharField(
        write_only=True, min_length=8, validators=[validate_password]
    )

    class Meta:
        model = User
        fields = ['name', 'email', 'password']

    def validate_email(self, value):
        clean_email = value.lower().strip()
        if User.objects.filter(email=clean_email).exists():
            raise serializers.ValidationError('A user with this email already exists.')
        return clean_email

    def create(self, validated_data):
        import random
        import uuid
        colors = ['#6C63FF', '#00D4AA', '#FF6B6B', '#FFB86C', '#50C8FF', '#FF79C6', '#8BE9FD']
        
        # Generate a truly unique username using uuid to avoid IntegrityError (500)
        base_username = validated_data['email'].split('@')[0][:100]
        unique_username = f"{base_username}_{uuid.uuid4().hex[:8]}"
        
        user = User.objects.create_user(
            username=unique_username,
            email=validated_data['email'],
            name=validated_data['name'],
            password=validated_data['password'],
            avatar_color=random.choice(colors),
        )
        return user

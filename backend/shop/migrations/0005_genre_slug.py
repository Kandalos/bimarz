from django.utils.text import slugify
from django.db import migrations, models


def create_slugs_for_existing_genres(apps, schema_editor):
    Genre = apps.get_model('shop', 'Genre')

    for genre in Genre.objects.all():
        base_slug = slugify(genre.name) or f"genre-{genre.id}"
        slug = base_slug
        counter = 1

        # ensure uniqueness
        while Genre.objects.filter(slug=slug).exclude(id=genre.id).exists():
            slug = f"{base_slug}-{counter}"
            counter += 1

        genre.slug = slug
        genre.save(update_fields=['slug'])


class Migration(migrations.Migration):

    dependencies = [
        ('shop', '0004_recommendedgroup'),
    ]

    operations = [
        # Create slug as unique=True from the start
        migrations.AddField(
            model_name='genre',
            name='slug',
            field=models.SlugField(max_length=120, unique=True, blank=True),
            preserve_default=False,
        ),

        # Populate slug values
        migrations.RunPython(
            code=create_slugs_for_existing_genres,
            reverse_code=migrations.RunPython.noop
        ),
    ]

      
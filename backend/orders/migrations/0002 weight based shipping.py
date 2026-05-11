from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        # Replace 'XXXX' with the actual latest migration number for the orders app
        ('orders', '0001_initial'),
    ]

    operations = [
        # ------------------------------------------------------------------
        # 1. New ShippingConfig singleton model
        # ------------------------------------------------------------------
        migrations.CreateModel(
            name='ShippingConfig',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('paper_weight_grams', models.DecimalField(
                    decimal_places=4,
                    max_digits=6,
                    default=0.08,
                    help_text=(
                        'Weight of a single page in grams '
                        '(e.g. 0.08 g/page for standard 80gsm paper).'
                    ),
                )),
            ],
            options={
                'verbose_name': 'Shipping Configuration',
                'verbose_name_plural': 'Shipping Configuration',
            },
        ),

        # ------------------------------------------------------------------
        # 2. Add weight-based pricing fields to ShippingZone
        # ------------------------------------------------------------------
        migrations.AddField(
            model_name='shippingzone',
            name='default_price',
            field=models.DecimalField(
                decimal_places=2,
                max_digits=8,
                default=0,
                help_text=(
                    'Fixed shipping price applied when shipment weight is within '
                    'the threshold (in EUR).'
                ),
            ),
        ),
        migrations.AddField(
            model_name='shippingzone',
            name='price_per_weight_unit',
            field=models.DecimalField(
                decimal_places=4,
                max_digits=8,
                default=0,
                help_text=(
                    'Price charged per gram of total shipment weight when weight '
                    'exceeds threshold (in EUR).'
                ),
            ),
        ),
        migrations.AddField(
            model_name='shippingzone',
            name='weight_threshold',
            field=models.DecimalField(
                decimal_places=2,
                max_digits=10,
                default=0,
                help_text=(
                    'Maximum shipment weight in grams that qualifies for the fixed '
                    'default price. If total weight exceeds this, per-weight pricing applies.'
                ),
            ),
        ),

        # ------------------------------------------------------------------
        # 3. Rename old price_eur → keep or remove it
        #    If you want to keep price_eur as a legacy field, skip this.
        #    To remove it uncomment the line below after confirming no code
        #    references it anymore.
        # ------------------------------------------------------------------
        # migrations.RemoveField(model_name='shippingzone', name='price_eur'),
    ]
from django.db import models

class Producto(models.Model):
    nombre = models.CharField(max_length=100)
    fecha = models.DateField()
    valor = models.DecimalField(max_digits=10, decimal_places=2)
    moneda = models.CharField(max_length=3, default='CLP')
    imagen = models.ImageField(upload_to='productos/', null=True, blank=True)

    def __str__(self):
        return self.nombre
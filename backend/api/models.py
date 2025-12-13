from django.db import models

class Producto(models.Model):
    nombre = models.CharField(max_length=100)
    fecha = models.DateField()
    valor = models.IntegerField()
    imagen = models.ImageField(upload_to='productos/', null=True, blank=True)

    def __str__(self):
        return self.nombre
# Reglas Permanentes del Proyecto: Repositorio y Git

## Protocolo previo a modificar archivos o código
1. Antes de comenzar cualquier trabajo que implique modificar archivos o código, siempre preguntarle al usuario:
   **"¿Cuál es el repositorio de GitHub con el que vamos a trabajar?"**
2. No asumir ni inventar el repositorio. Si ya existe un repositorio definido en el contexto actual, podés usarlo; de lo contrario, preguntámelo antes de hacer cualquier cambio.
3. Ante cualquier duda sobre qué repositorio usar, preguntar primero y no modificar ningún archivo.

## Reglas obligatorias de Git
Cada vez que realices cambios en el proyecto:
- Trabajá únicamente sobre el repositorio de GitHub indicado.
- Después de realizar los cambios, revisá qué archivos fueron modificados.
- Ejecutá las verificaciones o tests correspondientes cuando sea posible.
- Creá un commit con un mensaje claro y descriptivo.
- Hacé `git push` al repositorio remoto.
- Nunca dejes cambios realizados sin commit y push, salvo indicación explícita del usuario.
- No hagas `git reset --hard`, `git checkout` destructivo, `git clean` ni elimines cambios existentes sin preguntar primero.
- Antes de hacer push, asegurate de no sobrescribir ni descartar trabajo ajeno.
- Si el commit o el push falla, informame exactamente qué ocurrió y solucioná el problema si es seguro hacerlo.
- Al finalizar, informame brevemente:
  1. Qué cambiaste.
  2. Qué tests/verificaciones ejecutaste.
  3. Hash del commit.
  4. Si el push se realizó correctamente.

## Regla de prioridad
Estas reglas deben considerarse persistentes para todas las tareas futuras de desarrollo, hasta que sean modificadas explícitamente.

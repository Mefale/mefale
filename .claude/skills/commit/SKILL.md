---
name: commit
description: Use when the user wants to commit all current changes, optionally with a new branch and push instructions. Generates a conventional commit message in English based on git diff, and provides step-by-step terminal commands — does NOT execute them.
---

# commit

Skill para generar instrucciones de commit (y opcionalmente branch + push) a partir de los cambios actuales. Solo instructivo: Claude muestra los comandos, el usuario los ejecuta.

## Comportamiento

### Paso 1 — Leer el estado del repo

Corré mentalmente (o con las tools de lectura disponibles) los siguientes comandos para entender qué cambió:

```bash
git status
git diff --staged
git diff          # unstaged changes
git log -5 --oneline
```

Usá el resultado para:
- Identificar qué archivos cambiaron y qué tipo de cambio es (feat, fix, style, refactor, chore…)
- Redactar el mensaje de commit en inglés siguiendo **Conventional Commits**

### Paso 2 — Redactar el commit message

Formato obligatorio:
```
<type>(<scope>): <short description>

[optional body — solo si hay algo no obvio que explicar]
```

Tipos válidos: `feat`, `fix`, `style`, `refactor`, `chore`, `docs`, `test`

Reglas:
- En **inglés**
- Primera línea ≤ 72 caracteres
- Imperativo ("add", "fix", "update" — no "added", "fixed")
- Sin punto final
- Scope = módulo afectado (`offers`, `modal`, `cart`, `admin`, `sheets`, etc.)

Ejemplo:
```
feat(offers): improve visual style with warm gradient and flame badge
```

### Paso 3 — Mostrar los comandos

Mostrá siempre este bloque:

```bash
git add -p          # revisar cambios antes de stagear (recomendado)
# — o —
git add <archivos>  # agregar archivos específicos

git commit -m "<mensaje generado>"
```

> **Nunca** usar `git add .` ni `git add -A` — puede incluir archivos sensibles o no deseados.

---

## Si el usuario menciona subir a un branch

Cuando el usuario dice "para subir", "push", "branch", "rama", o similar, agregá una sección extra con instrucciones para crear el branch y hacer push.

### Branch name

Formato: `<type>/<short-kebab-description>`

Ejemplos: `feat/offers-visual-polish`, `fix/modal-cart-button`, `chore/cleanup-types`

En **inglés**, kebab-case, sin números de ticket salvo que el usuario lo indique.

### Bloque de comandos para branch nuevo

```bash
# 1. Crear el branch desde el estado actual
git checkout -b <branch-name>

# 2. Stagear y commitear (igual que arriba)
git add <archivos>
git commit -m "<mensaje generado>"

# 3. Subir al remoto
git push -u origin <branch-name>
```

### Si ya está en un branch existente (no main/master)

```bash
# Stagear y commitear
git add <archivos>
git commit -m "<mensaje generado>"

# Push al branch actual
git push
# — o, si el upstream no está seteado —
git push -u origin <nombre-del-branch-actual>
```

---

## Qué NO hacer

- No ejecutar ningún comando git.
- No hacer `git add .` ni `git add -A`.
- No commitear automáticamente aunque el usuario diga "hacé el commit".
- No inventar cambios — basarse solo en lo que `git diff` y `git status` muestran.
- No sugerir `--force` ni `--no-verify` salvo que el usuario lo pida explícitamente.

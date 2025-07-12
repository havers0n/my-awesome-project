# Как добавить новую иконку

1. **Поместите .svg файл** в папку `frontend/public/images/icons/`.
2. **Зарегистрируйте иконку** в файле `src/helpers/icons.ts`:
   ```ts
   export const icons = {
     ...,
     yourNewIcon: '/images/icons/your-new-icon.svg',
   };
   ```
3. **Используйте иконку в коде**:
   ```tsx
   <img src={icons.yourNewIcon} alt="Описание" />
   ```
4. (Опционально) Добавьте имя иконки в тип `IconName` для автодополнения. 
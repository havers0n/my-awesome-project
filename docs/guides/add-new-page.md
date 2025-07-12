# Как добавить новую страницу

1. **Создайте файл компонента** в `src/pages/`.
2. **Добавьте маршрут** в `src/App.tsx` внутри `<ProtectedRoute>` (или публичный, если страница не требует авторизации).
3. **Добавьте ссылку в боковое меню**: откройте `src/layout/AppSidebar.tsx` и добавьте пункт меню с новым маршрутом.
4. (Опционально) Добавьте SEO-мета-теги через компонент `PageMeta`.

_Пример:_
- `src/pages/ReportsPage.tsx`
- В `src/App.tsx`:
  ```tsx
  <Route path="/reports" element={<ReportsPage />} />
  ```
- В `src/layout/AppSidebar.tsx`:
  ```tsx
  { label: 'Отчёты', icon: 'report', path: '/reports' }
  ``` 
INSERT INTO `users` (
  `id`,
  `name`,
  `email`,
  `salt`,
  `password`,
  `type_user`,
  `active`,
  `created_at`,
  `updated_at`
)
SELECT
  UUID(),
  'Admin',
  'admin@admin.com',
  '13c147afdc',
  'DfdNhPTcm420fYoX5RLNZvgR5fm9jJ9I8zhf2lSkQM+AJXSNyzS04/XdB3EnUlhQWbieCb6V+Q2t0/MqSCMeeQ==',
  'ADMIN',
  1,
  NOW(6),
  NOW(6)
WHERE NOT EXISTS (
  SELECT 1 FROM `users` WHERE `email` = 'admin@admin.com'
);

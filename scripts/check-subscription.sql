-- Check current subscription status
SELECT 
  u.email,
  s.plan,
  s.status,
  s.currentPodcastCount,
  s.monthlyPodcastLimit,
  s.currentMinutesUsed,
  s.monthlyMinutesLimit
FROM "User" u
LEFT JOIN "Subscription" s ON u.id = s."userId"
ORDER BY u."createdAt" DESC
LIMIT 5;

-- Reset usage for testing (run this to reset your limits)
-- UPDATE "Subscription" 
-- SET "currentPodcastCount" = 0, 
--     "currentMinutesUsed" = 0
-- WHERE "userId" IN (
--   SELECT id FROM "User" 
--   ORDER BY "createdAt" DESC 
--   LIMIT 1
-- );

-- FurShield: Schema fixes + comprehensive sample data
-- Run this after initial schema import

USE furshield;

-- ============================================================
-- 1. SCHEMA FIXES
-- ============================================================

-- Add bio to vet_profiles
ALTER TABLE vet_profiles ADD COLUMN IF NOT EXISTS bio TEXT DEFAULT NULL;

-- Add available_date and is_booked to vet_availability
ALTER TABLE vet_availability ADD COLUMN IF NOT EXISTS available_date DATE DEFAULT NULL AFTER end_time;
ALTER TABLE vet_availability ADD COLUMN IF NOT EXISTS is_booked TINYINT(1) DEFAULT 0 AFTER is_available;

-- Populate available_date from day_of_week (use next 2 weeks)
UPDATE vet_availability SET available_date = 
  DATE_ADD(CURDATE(), INTERVAL (
    CASE day_of_week
      WHEN 'Monday' THEN (9 - DAYOFWEEK(CURDATE())) % 7
      WHEN 'Tuesday' THEN (10 - DAYOFWEEK(CURDATE())) % 7
      WHEN 'Wednesday' THEN (11 - DAYOFWEEK(CURDATE())) % 7
      WHEN 'Thursday' THEN (12 - DAYOFWEEK(CURDATE())) % 7
      WHEN 'Friday' THEN (13 - DAYOFWEEK(CURDATE())) % 7
      WHEN 'Saturday' THEN (14 - DAYOFWEEK(CURDATE())) % 7
      WHEN 'Sunday' THEN (15 - DAYOFWEEK(CURDATE())) % 7
    END
  ) DAY)
WHERE available_date IS NULL;

-- ============================================================
-- 2. CLEAN UP TEST USERS
-- ============================================================
DELETE FROM owner_profiles WHERE user_id IN (7,8,9);
DELETE FROM shelter_profiles WHERE user_id IN (10);
DELETE FROM cart_items WHERE cart_id IN (SELECT id FROM cart WHERE user_id IN (7,8,9));
DELETE FROM cart WHERE user_id IN (7,8,9);
DELETE FROM users WHERE id IN (7,8,9,10);

-- ============================================================
-- 3. UPDATE APPOINTMENT DATES TO FUTURE
-- ============================================================
UPDATE appointments SET date = DATE_ADD(CURDATE(), INTERVAL 2 DAY) WHERE id = 4;
UPDATE appointments SET date = DATE_ADD(CURDATE(), INTERVAL 5 DAY) WHERE id = 5;
UPDATE appointments SET date = DATE_SUB(CURDATE(), INTERVAL 14 DAY) WHERE id = 1;
UPDATE appointments SET date = DATE_SUB(CURDATE(), INTERVAL 7 DAY) WHERE id = 2;
UPDATE appointments SET date = DATE_SUB(CURDATE(), INTERVAL 10 DAY) WHERE id = 3;

-- ============================================================
-- 4. ADD MORE PETS FOR OWNER SARAH (id=1)
-- ============================================================
INSERT INTO pets (owner_id, name, species, breed, age, gender, weight, color, health_status) VALUES
(1, 'Bella', 'Cat', 'Siamese', '2 Years', 'Female', 4.20, 'Cream/Brown', 'Healthy'),
(1, 'Max', 'Dog', 'German Shepherd', '4 Years', 'Male', 32.50, 'Black/Tan', 'Healthy');

-- Add pet images (primary) for all of sarah's pets
INSERT INTO pet_images (pet_id, image_path, is_primary) VALUES
(1, '', 1), (2, '', 1), (5, '', 1), (6, '', 1);

-- ============================================================
-- 5. ADD MORE HEALTH RECORDS
-- ============================================================
INSERT INTO health_records (pet_id, vet_id, type, title, description, date) VALUES
(1, 3, 'vaccination', 'Rabies Vaccination', 'Annual rabies shot administered. No adverse reactions.', DATE_SUB(CURDATE(), INTERVAL 30 DAY)),
(1, 3, 'checkup', 'Annual Wellness Check', 'Complete physical examination. Weight normal, teeth clean.', DATE_SUB(CURDATE(), INTERVAL 14 DAY)),
(2, 3, 'vaccination', 'FVRCP Booster', 'Feline distemper combo vaccine given.', DATE_SUB(CURDATE(), INTERVAL 20 DAY)),
(5, NULL, 'checkup', 'New Pet Checkup', 'Initial health assessment for Bella. All vitals normal.', DATE_SUB(CURDATE(), INTERVAL 5 DAY)),
(6, NULL, 'vaccination', 'DHPP Vaccine', 'Distemper/parvo combo vaccine administered.', DATE_SUB(CURDATE(), INTERVAL 3 DAY)),
(1, 3, 'treatment', 'Ear Infection Treatment', 'Mild ear infection detected. Prescribed antibiotic ear drops for 7 days.', DATE_SUB(CURDATE(), INTERVAL 45 DAY));

-- ============================================================
-- 6. ADD MORE APPOINTMENTS
-- ============================================================
INSERT INTO appointments (owner_id, vet_id, pet_id, date, time, status, reason) VALUES
(1, 4, 5, DATE_ADD(CURDATE(), INTERVAL 8 DAY), '10:00:00', 'pending', 'First checkup for new cat Bella'),
(1, 3, 6, DATE_ADD(CURDATE(), INTERVAL 12 DAY), '14:30:00', 'pending', 'Vaccination follow-up for Max'),
(2, 3, 3, DATE_ADD(CURDATE(), INTERVAL 3 DAY), '11:00:00', 'approved', 'Skin condition follow-up'),
(1, 3, 1, DATE_SUB(CURDATE(), INTERVAL 2 DAY), '09:00:00', 'completed', 'Post-treatment ear check');

-- ============================================================
-- 7. UPDATE VET PROFILES WITH SPECIALIZATIONS & BIOS
-- ============================================================
UPDATE vet_profiles SET
  specialization = 'Small Animal Medicine',
  experience = '8 Years',
  qualifications = 'DVM, MS Veterinary Science',
  clinic_name = 'Pet Care Clinic DHA',
  consultation_fee = 2500.00,
  rating = 4.8,
  total_reviews = 3,
  bio = 'Experienced veterinarian specializing in dogs and cats with 8 years of clinical practice.'
WHERE user_id = 3;

UPDATE vet_profiles SET
  specialization = 'Exotic Animal Care',
  experience = '6 Years',
  qualifications = 'DVM, Certificate in Avian Medicine',
  clinic_name = 'Animal Wellness Center Gulshan',
  consultation_fee = 2000.00,
  rating = 4.6,
  total_reviews = 2,
  bio = 'Specialist in exotic pets including birds, reptiles, and small mammals.'
WHERE user_id = 4;

-- ============================================================
-- 8. ADD MORE NOTIFICATIONS
-- ============================================================
INSERT INTO notifications (user_id, title, message, type, is_read) VALUES
(1, 'Bella''s Vaccination Due', 'Your cat Bella is due for her FVRCP booster next week.', 'vaccination', 0),
(1, 'Order Delivered', 'Your order #1 has been delivered successfully.', 'order', 1),
(1, 'Appointment Reminder', 'You have an appointment with Dr. Sarah Ahmed in 2 days.', 'appointment', 0),
(3, 'New Patient', 'Max (German Shepherd) has been assigned to you.', 'appointment', 0),
(3, 'Review Received', 'Sarah Ahmed left you a 5-star review!', 'info', 0),
(5, 'New Adoption Application', 'A new application has been submitted for one of your listings.', 'adoption', 0);

-- ============================================================
-- 9. ADD MORE REVIEWS
-- ============================================================
INSERT INTO reviews (user_id, target_type, target_id, rating, comment) VALUES
(1, 'vet', 4, 4, 'Dr. Hamza was very knowledgeable about my bird. Gave great advice on diet.'),
(2, 'vet', 3, 5, 'Dr. Sarah is wonderful with Milo. Very gentle and patient.'),
(1, 'product', 3, 4, 'Luna enjoys this toy, though it wore out after a couple months.'),
(2, 'product', 5, 5, 'Great supplement for Milo''s joints. Noticed improvement within a week.');

-- ============================================================
-- 10. ADD MORE ADOPTION APPLICATIONS
-- ============================================================
INSERT INTO adoption_applications (listing_id, applicant_id, reason, status) VALUES
(2, 1, 'I have a big backyard and experience with dogs. Would love to adopt!', 'pending'),
(5, 1, 'Looking for a companion for my cat. This kitten seems perfect.', 'pending');

-- ============================================================
-- 11. ADD SHELTER PROFILES
-- ============================================================
INSERT INTO shelter_profiles (user_id, shelter_name, description, operating_hours, capacity) VALUES
(5, 'Paws & Hope Shelter', 'A no-kill animal shelter dedicated to rescuing and rehoming abandoned pets.', 'Mon-Sat 9AM-6PM', 50)
ON DUPLICATE KEY UPDATE shelter_name = 'Paws & Hope Shelter';

INSERT INTO shelter_profiles (user_id, shelter_name, description, operating_hours, capacity) VALUES
(6, 'Furever Home Rescue', 'Dedicated to finding loving homes for stray and abandoned animals.', 'Mon-Fri 10AM-5PM', 30)
ON DUPLICATE KEY UPDATE shelter_name = 'Furever Home Rescue';

-- ============================================================
-- 12. ADD MORE CART ITEMS & ORDERS
-- ============================================================
INSERT INTO orders (user_id, total, status, shipping_address) VALUES
(1, 8500.00, 'pending', '42-B Garden Town, Karachi');

SET @oid = LAST_INSERT_ID();
INSERT INTO order_items (order_id, product_id, quantity, price) VALUES
(@oid, 1, 1, 4850.00),
(@oid, 7, 1, 2200.00),
(@oid, 8, 1, 850.00);

-- ============================================================
-- 13. ADD ADOPTION LISTINGS FOR SHELTER 6
-- ============================================================
INSERT INTO adoption_listings (shelter_id, name, species, breed, age, gender, health_status, description, adoption_status) VALUES
(6, 'Shadow', 'Cat', 'Black Domestic Shorthair', '3 Years', 'Male', 'Healthy', 'Friendly and affectionate cat. Loves being petted and will curl up on your lap for hours.', 'available'),
(6, 'Rosie', 'Dog', 'Labrador Mix', '1 Year', 'Female', 'Healthy', 'Energetic and playful young dog. Great with kids and other dogs. House-trained.', 'available'),
(6, 'Tweety', 'Bird', 'Budgerigar', '1 Year', 'Male', 'Healthy', 'Beautiful green and yellow budgie. Loves to sing and interact.', 'available');

-- ============================================================
-- 14. ADD CARE ARTICLES
-- ============================================================
INSERT INTO care_articles (title, category, content, author, views) VALUES
('How to Keep Your Dog Healthy in Summer', 'Health', 'Summer can be tough on our furry friends. Make sure they always have access to fresh water, avoid walking during peak heat hours (11AM-3PM), and watch for signs of heatstroke like excessive panting, drooling, or lethargy. Consider cooling mats and frozen treats to keep them comfortable.', 'Dr. Sarah Ahmed', 245),
('Understanding Cat Body Language', 'Behavior', 'Cats communicate through their body language. A slow blink means trust and affection. An upright tail signals happiness, while a puffed tail indicates fear. Learn these cues to better understand your feline companion.', 'Dr. Hamza Khan', 189),
('Nutrition Guide for Puppies', 'Nutrition', 'Puppies need a balanced diet rich in protein, fats, and carbohydrates. Feed them 3-4 times a day until 6 months, then transition to twice daily. Choose high-quality puppy food appropriate for their breed size.', 'Dr. Sarah Ahmed', 312);

SELECT 'Migration complete!' as status;

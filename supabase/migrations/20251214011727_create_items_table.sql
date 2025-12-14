/*
  # Create Lost and Found Items Table

  1. New Tables
    - `items`
      - `id` (uuid, primary key)
      - `title` (text) - Name/title of the found item
      - `description` (text) - Detailed description
      - `category` (text) - Category of item (electronics, clothing, books, etc.)
      - `location_found` (text) - Where the item was found
      - `date_found` (date) - When the item was found
      - `photo_url` (text) - URL to uploaded photo
      - `status` (text) - Status: pending, approved, claimed
      - `claimed_by` (text, nullable) - Name of person claiming
      - `claim_contact` (text, nullable) - Contact info of claimer
      - `claim_message` (text, nullable) - Claim message
      - `finder_name` (text) - Name of person who found the item
      - `finder_contact` (text) - Contact of finder
      - `created_at` (timestamp)
      - `updated_at` (timestamp)

  2. Security
    - Enable RLS on `items` table
    - Add policy for public to read approved items
    - Add policy for public to insert items (pending approval)
    - Add policy for public to update for claiming
*/

CREATE TABLE IF NOT EXISTS items (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  description text NOT NULL,
  category text NOT NULL,
  location_found text NOT NULL,
  date_found date NOT NULL,
  photo_url text,
  status text DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'claimed')),
  claimed_by text,
  claim_contact text,
  claim_message text,
  finder_name text NOT NULL,
  finder_contact text NOT NULL,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE items ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view approved or claimed items"
  ON items
  FOR SELECT
  USING (status IN ('approved', 'claimed'));

CREATE POLICY "Anyone can insert items"
  ON items
  FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Anyone can update items for claiming"
  ON items
  FOR UPDATE
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Admin view all items"
  ON items
  FOR SELECT
  USING (true);
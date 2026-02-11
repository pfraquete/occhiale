-- ============================================
-- OCCHIALE Migration 00003
-- Enable Supabase Realtime for WhatsApp tables
-- Required for live dashboard updates
-- ============================================

-- Add WhatsApp tables to the Realtime publication
-- This allows clients to subscribe to INSERT/UPDATE/DELETE events
ALTER PUBLICATION supabase_realtime ADD TABLE whatsapp_messages;
ALTER PUBLICATION supabase_realtime ADD TABLE whatsapp_conversations;

-- Create progress-photos storage bucket
INSERT INTO storage.buckets (id, name, public)
VALUES ('progress-photos', 'progress-photos', true)
ON CONFLICT (id) DO NOTHING;

-- Create policy to allow users to upload their own progress photos
CREATE POLICY "Users can upload own progress photos"
  ON storage.objects FOR INSERT
  WITH CHECK (
    bucket_id = 'progress-photos' 
    AND auth.uid()::text = (storage.foldername(name))[1]
  );

-- Create policy to allow users to view their own progress photos
CREATE POLICY "Users can view own progress photos"
  ON storage.objects FOR SELECT
  USING (
    bucket_id = 'progress-photos' 
    AND auth.uid()::text = (storage.foldername(name))[1]
  );

-- Create policy to allow users to delete their own progress photos
CREATE POLICY "Users can delete own progress photos"
  ON storage.objects FOR DELETE
  USING (
    bucket_id = 'progress-photos' 
    AND auth.uid()::text = (storage.foldername(name))[1]
  );

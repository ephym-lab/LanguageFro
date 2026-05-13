'use client'

import { useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Textarea } from '@/components/ui/textarea'
import { VoiceRecorder } from '@/components/VoiceRecorder'
import { useDataset } from '@/lib/queries/datasets'
import { useCreateResponse, useUploadVoiceRecording } from '@/lib/queries/responses'
import { useUserLanguages } from '@/lib/queries/auth'
import { useCategories } from '@/lib/queries/categories'
import { ArrowLeft, AlertCircle, Loader2 } from 'lucide-react'
import { toast } from 'sonner'

export default function ContributePage() {
  const params = useParams()
  const router = useRouter()
  const datasetId = params.id as string

  const [textInput, setTextInput] = useState('')
  const [selectedTab, setSelectedTab] = useState('text')
  const [selectedLanguageId, setSelectedLanguageId] = useState<string>('')
  const [selectedCategoryId, setSelectedCategoryId] = useState<string>('')

  const { data: dataset, isLoading: isLoadingDataset } = useDataset(datasetId)
  const { data: userLanguages, isLoading: isLoadingLanguages } = useUserLanguages()
  const { data: categories, isLoading: isLoadingCategories } = useCategories()
  const createResponse = useCreateResponse()
  const uploadVoice = useUploadVoiceRecording()

  const handleTextSubmit = async () => {
    if (!textInput.trim()) return
    if (!selectedLanguageId) {
      alert('Please select a language')
      return
    }
    if (!selectedCategoryId) {
      alert('Please select a category')
      return
    }

    try {
      await createResponse.mutateAsync({
        dataset_id: datasetId,
        response_text: textInput,
        language_id: selectedLanguageId,
        category_id: selectedCategoryId,
      })
      toast.success("Response submitted successfully")
      setTextInput('')
      router.push(`/dashboard/datasets/${datasetId}`)
    } catch (error: any) {
      console.error('Error submitting response:', error)
      const errorMessage = error.response?.data?.error || error.response?.data?.message || error.message || 'Failed to submit response'
      toast.error(`Error: ${errorMessage}`)
    }
  }

  const handleVoiceSubmit = async (audioBlob: Blob) => {
    if (!selectedLanguageId) {
      toast.error('Please select a language')
      return
    }
    if (!selectedCategoryId) {
      toast.error('Please select a category')
      return
    }

    try {
      await uploadVoice.mutateAsync({
        dataset_id: datasetId,
        audio_blob: audioBlob,
        language_variant_id: selectedLanguageId,
      })
      toast.success("Voice recording uploaded successfully")
      router.push(`/dashboard/datasets/${datasetId}`)
    } catch (error: any) {
      console.error('Error uploading voice:', error)
      const errorMessage = error.response?.data?.error || error.response?.data?.message || error.message || 'Failed to upload voice'
      toast.error(`Error: ${errorMessage}`)
    }
  }

  // Extract languages - userLanguages should be the array directly
  const languages = Array.isArray(userLanguages) ? userLanguages : []
  
  // Extract categories from dataset's allowed_categories
  const availableCategories = dataset?.allowed_categories || []

  console.log('User languages array:', languages)
  console.log('Available categories:', availableCategories)
  console.log('Is loading languages:', isLoadingLanguages)

  if (isLoadingDataset || isLoadingLanguages || isLoadingCategories) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <Loader2 className="w-12 h-12 animate-spin text-primary mx-auto mb-4" />
          <p className="text-muted-foreground">Loading...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => router.back()}
          className="gap-2"
        >
          <ArrowLeft className="w-4 h-4" />
          Back
        </Button>
        <div>
          <h1 className="text-3xl font-bold text-foreground">Contribute to Dataset</h1>
          <p className="text-muted-foreground">
            {dataset?.original_text?.substring(0, 100)}
            {dataset?.original_text && dataset.original_text.length > 100 ? '...' : ''}
          </p>
        </div>
      </div>

      <Card className="p-6 bg-card border border-border">
        <Tabs value={selectedTab} onValueChange={setSelectedTab}>
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="text">Text Response</TabsTrigger>
            <TabsTrigger value="voice">Voice Recording</TabsTrigger>
          </TabsList>

          <TabsContent value="text" className="space-y-4 mt-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium text-foreground block mb-2">
                  Your Language *
                </label>
                <select
                  value={selectedLanguageId}
                  onChange={(e) => setSelectedLanguageId(e.target.value)}
                  className="w-full p-2 rounded-md bg-input border border-border text-foreground"
                  required
                >
                  <option value="">Select a language...</option>
                  {languages.map((lang) => (
                    <option key={lang.id} value={lang.id}>
                      {lang.name} ({lang.code})
                    </option>
                  ))}
                </select>
                {languages.length === 0 && !isLoadingLanguages && (
                  <p className="text-xs text-amber-500 mt-1">
                    No languages found in your profile. Please add languages in your settings.
                  </p>
                )}
              </div>

              <div>
                <label className="text-sm font-medium text-foreground block mb-2">
                  Category *
                </label>
                <select
                  value={selectedCategoryId}
                  onChange={(e) => setSelectedCategoryId(e.target.value)}
                  className="w-full p-2 rounded-md bg-input border border-border text-foreground"
                  required
                >
                  <option value="">Select a category...</option>
                  {availableCategories.map((category) => (
                    <option key={category.id} value={category.id}>
                      {category.name} - {category.description}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div>
              <label className="text-sm font-medium text-foreground block mb-2">
                Your Response *
              </label>
              <Textarea
                placeholder="Enter your translation, transcription, or contribution here..."
                value={textInput}
                onChange={(e) => setTextInput(e.target.value)}
                className="min-h-40 bg-input border border-border"
                required
              />
              <p className="text-xs text-muted-foreground mt-2">
                {textInput.length} characters
              </p>
            </div>

            <div className="flex gap-2">
              <Button
                onClick={handleTextSubmit}
                disabled={
                  !textInput.trim() || 
                  !selectedLanguageId || 
                  !selectedCategoryId || 
                  createResponse.isPending
                }
                className="ml-auto"
              >
                {createResponse.isPending ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Submitting...
                  </>
                ) : (
                  'Submit Response'
                )}
              </Button>
            </div>

            {createResponse.isError && (
              <div className="flex gap-2 p-3 rounded-lg bg-destructive/10 text-destructive text-sm">
                <AlertCircle className="w-4 h-4 mt-0.5 flex-shrink-0" />
                <span>Failed to submit response. Please try again.</span>
              </div>
            )}
          </TabsContent>

          <TabsContent value="voice" className="space-y-4 mt-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium text-foreground block mb-2">
                  Your Language *
                </label>
                <select
                  value={selectedLanguageId}
                  onChange={(e) => setSelectedLanguageId(e.target.value)}
                  className="w-full p-2 rounded-md bg-input border border-border text-foreground"
                  required
                >
                  <option value="">Select a language...</option>
                  {languages.map((lang) => (
                    <option key={lang.id} value={lang.id}>
                      {lang.name} ({lang.code})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="text-sm font-medium text-foreground block mb-2">
                  Category *
                </label>
                <select
                  value={selectedCategoryId}
                  onChange={(e) => setSelectedCategoryId(e.target.value)}
                  className="w-full p-2 rounded-md bg-input border border-border text-foreground"
                  required
                >
                  <option value="">Select a category...</option>
                  {availableCategories.map((category) => (
                    <option key={category.id} value={category.id}>
                      {category.name} - {category.description}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <VoiceRecorder
              onRecordingComplete={handleVoiceSubmit}
              isLoading={uploadVoice.isPending}
            />

            {uploadVoice.isError && (
              <div className="flex gap-2 p-3 rounded-lg bg-destructive/10 text-destructive text-sm">
                <AlertCircle className="w-4 h-4 mt-0.5 flex-shrink-0" />
                <span>Failed to upload recording. Please try again.</span>
              </div>
            )}
          </TabsContent>
        </Tabs>
      </Card>
    </div>
  )
}
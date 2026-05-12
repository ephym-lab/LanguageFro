'use client'

import { useState, useRef } from 'react'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Mic, Square, Play, Trash2, Send } from 'lucide-react'

interface VoiceRecorderProps {
  onRecordingComplete: (blob: Blob) => void
  isLoading?: boolean
}

export function VoiceRecorder({ onRecordingComplete, isLoading }: VoiceRecorderProps) {
  const [isRecording, setIsRecording] = useState(false)
  const [recordedAudio, setRecordedAudio] = useState<Blob | null>(null)
  const [isPlaying, setIsPlaying] = useState(false)
  const mediaRecorderRef = useRef<MediaRecorder | null>(null)
  const audioChunksRef = useRef<Blob[]>([])
  const audioRef = useRef<HTMLAudioElement | null>(null)

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true })
      const mediaRecorder = new MediaRecorder(stream)
      mediaRecorderRef.current = mediaRecorder
      audioChunksRef.current = []

      mediaRecorder.ondataavailable = (event) => {
        audioChunksRef.current.push(event.data)
      }

      mediaRecorder.onstop = () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' })
        setRecordedAudio(audioBlob)
        stream.getTracks().forEach((track) => track.stop())
      }

      mediaRecorder.start()
      setIsRecording(true)
    } catch (error) {
      console.error('Error accessing microphone:', error)
    }
  }

  const stopRecording = () => {
    if (mediaRecorderRef.current) {
      mediaRecorderRef.current.stop()
      setIsRecording(false)
    }
  }

  const playRecording = () => {
    if (recordedAudio && !audioRef.current) {
      const url = URL.createObjectURL(recordedAudio)
      audioRef.current = new Audio(url)
      audioRef.current.onended = () => {
        setIsPlaying(false)
        if (audioRef.current) {
          URL.revokeObjectURL(audioRef.current.src)
          audioRef.current = null
        }
      }
      setIsPlaying(true)
      audioRef.current.play()
    }
  }

  const clearRecording = () => {
    if (audioRef.current) {
      audioRef.current.pause()
      URL.revokeObjectURL(audioRef.current.src)
      audioRef.current = null
    }
    setRecordedAudio(null)
    setIsPlaying(false)
  }

  const submitRecording = () => {
    if (recordedAudio) {
      onRecordingComplete(recordedAudio)
    }
  }

  return (
    <Card className="p-6 bg-card border border-border">
      <div className="space-y-4">
        {!recordedAudio ? (
          <div className="flex flex-col items-center gap-4">
            <div className="text-center">
              <Mic className="w-12 h-12 mx-auto mb-2 text-primary" />
              <p className="text-sm text-muted-foreground">
                {isRecording ? 'Recording...' : 'Ready to record'}
              </p>
            </div>
            <div className="flex gap-2">
              {!isRecording ? (
                <Button
                  onClick={startRecording}
                  className="gap-2"
                  size="lg"
                  variant="default"
                >
                  <Mic className="w-4 h-4" />
                  Start Recording
                </Button>
              ) : (
                <Button
                  onClick={stopRecording}
                  className="gap-2"
                  size="lg"
                  variant="destructive"
                >
                  <Square className="w-4 h-4" />
                  Stop Recording
                </Button>
              )}
            </div>
          </div>
        ) : (
          <div className="flex flex-col gap-4">
            <div className="flex items-center justify-between p-3 bg-muted rounded-lg">
              <span className="text-sm font-medium">Recording ready</span>
              <span className="text-xs text-muted-foreground">
                {(recordedAudio.size / 1024).toFixed(1)} KB
              </span>
            </div>
            <div className="flex gap-2 flex-wrap">
              <Button
                onClick={playRecording}
                disabled={isPlaying || isLoading}
                variant="outline"
                className="gap-2"
              >
                <Play className="w-4 h-4" />
                {isPlaying ? 'Playing...' : 'Preview'}
              </Button>
              <Button
                onClick={clearRecording}
                disabled={isLoading}
                variant="outline"
                className="gap-2"
              >
                <Trash2 className="w-4 h-4" />
                Clear
              </Button>
              <Button
                onClick={submitRecording}
                disabled={isLoading}
                className="gap-2 ml-auto"
              >
                <Send className="w-4 h-4" />
                {isLoading ? 'Submitting...' : 'Submit'}
              </Button>
            </div>
          </div>
        )}
      </div>
    </Card>
  )
}

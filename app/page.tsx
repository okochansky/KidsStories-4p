"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Plus, Minus, Sparkles, BookOpen } from "lucide-react"

export default function StoryBuilder() {
  const [storyElements, setStoryElements] = useState(["", "", ""])
  const [generatedStory, setGeneratedStory] = useState("")
  const [generatedImages, setGeneratedImages] = useState<string[]>([])
  const [isGenerating, setIsGenerating] = useState(false)
  const [isGeneratingImages, setIsGeneratingImages] = useState(false)
  const [expandedImage, setExpandedImage] = useState<string | null>(null)
  const [expandedImageIndex, setExpandedImageIndex] = useState<number | null>(null)

  const addTextbox = () => {
    setStoryElements([...storyElements, ""])
  }

  const removeTextbox = () => {
    if (storyElements.length > 1) {
      setStoryElements(storyElements.slice(0, -1))
    }
  }

  const updateElement = (index: number, value: string) => {
    const updated = [...storyElements]
    updated[index] = value
    setStoryElements(updated)
  }

  const generateStory = async () => {
    setIsGenerating(true)
    setGeneratedStory("")
    setGeneratedImages([])
    
    try {
      const validElements = storyElements.filter((el) => el.trim() !== "")
      
      if (validElements.length === 0) {
        alert("Please enter at least one story element!")
        setIsGenerating(false)
        return
      }

      // Step 1: Generate the story first
      const storyResponse = await fetch('/api/generate-story', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          storyElements: validElements
        }),
      })

      if (!storyResponse.ok) {
        let errorMessage = `HTTP ${storyResponse.status}: ${storyResponse.statusText}`
        try {
          const errorData = await storyResponse.json()
          errorMessage = errorData.error || errorMessage
        } catch (e) {
          // If we can't parse the error response, use the status text
        }
        throw new Error(errorMessage)
      }

      const storyData = await storyResponse.json()
      setGeneratedStory(storyData.story)
      setIsGenerating(false)

      // Step 2: Now generate images in the background
      generateImages(storyData.story)
      
    } catch (error) {
      console.error('Error generating story:', error)
      alert(`Error generating story: ${error instanceof Error ? error.message : 'Unknown error'}`)
      setIsGenerating(false)
    }
  }

  const generateImages = async (story: string) => {
    setIsGeneratingImages(true)
    
    try {
      const imageResponse = await fetch('/api/generate-images', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          story: story
        }),
      })

      if (!imageResponse.ok) {
        let errorMessage = `HTTP ${imageResponse.status}: ${imageResponse.statusText}`
        try {
          const errorData = await imageResponse.json()
          errorMessage = errorData.error || errorMessage
        } catch (e) {
          // If we can't parse the error response, use the status text
        }
        throw new Error(errorMessage)
      }

      const imageData = await imageResponse.json()
      
      // Set the generated images
      if (imageData.images && imageData.images.length > 0) {
        const imageUrls = imageData.images.map((img: any) => img.url)
        setGeneratedImages(imageUrls)
      }
      
    } catch (error) {
      console.error('Error generating images:', error)
      // Show placeholder images if generation fails
      setGeneratedImages([
        "/placeholder.svg?height=300&width=400&text=Failed+to+load",
        "/placeholder.svg?height=300&width=400&text=Failed+to+load", 
        "/placeholder.svg?height=300&width=400&text=Failed+to+load",
      ])
    } finally {
      setIsGeneratingImages(false)
    }
  }

  const openImageModal = (imageUrl: string, index: number) => {
    setExpandedImage(imageUrl)
    setExpandedImageIndex(index)
  }

  const closeImageModal = () => {
    setExpandedImage(null)
    setExpandedImageIndex(null)
  }

  // Handle keyboard events and body scroll for modal
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && expandedImage) {
        closeImageModal()
      }
    }

    if (expandedImage) {
      // Prevent body scrolling when modal is open
      document.body.style.overflow = 'hidden'
      document.addEventListener('keydown', handleKeyDown)
    } else {
      // Restore body scrolling when modal is closed
      document.body.style.overflow = 'unset'
    }

    return () => {
      document.body.style.overflow = 'unset'
      document.removeEventListener('keydown', handleKeyDown)
    }
  }, [expandedImage])

  // Handle keyboard events for modal (keeping the React version for the main div)
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Escape' && expandedImage) {
      closeImageModal()
    }
  }

  return (
    <div 
      className="min-h-screen bg-gradient-to-br from-purple-100 via-pink-50 to-blue-100 p-4"
      onKeyDown={handleKeyDown}
      tabIndex={0}
    >
      <div className="max-w-4xl mx-auto space-y-8">
        {/* Header */}
        <div className="text-center space-y-4 py-8">
          <div className="flex items-center justify-center gap-2">
            <BookOpen className="h-8 w-8 text-purple-600" />
            <h1 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
              Story Builder
            </h1>
          </div>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Create magical stories for kids! Tell us what should be in your story, and we'll create an amazing
            adventure.
          </p>
        </div>

        {/* Story Elements Input */}
        <Card className="shadow-lg border-0 bg-white/80 backdrop-blur-sm">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-2xl text-purple-700">
              <Sparkles className="h-6 w-6" />
              What should be in your story?
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {storyElements.map((element, index) => (
              <div key={index} className="space-y-2">
                <label className="text-sm font-medium text-gray-700">Story Element {index + 1}</label>
                <Input
                  value={element}
                  onChange={(e) => updateElement(index, e.target.value)}
                  placeholder={`Enter something for your story (e.g., ${
                    index === 0 ? "a brave princess" : index === 1 ? "a magical dragon" : "a hidden castle"
                  })`}
                  className="text-lg p-4 border-2 border-purple-200 focus:border-purple-400 rounded-xl"
                />
              </div>
            ))}

            {/* Add/Remove Buttons */}
            <div className="flex gap-3 pt-4">
              <Button
                onClick={addTextbox}
                variant="outline"
                className="flex items-center gap-2 border-green-300 text-green-700 hover:bg-green-50"
              >
                <Plus className="h-4 w-4" />
                Add More
              </Button>
              <Button
                onClick={removeTextbox}
                variant="outline"
                disabled={storyElements.length <= 1}
                className="flex items-center gap-2 border-red-300 text-red-700 hover:bg-red-50 disabled:opacity-50"
              >
                <Minus className="h-4 w-4" />
                Remove
              </Button>
            </div>

            {/* Generate Story Button */}
            <div className="pt-6">
              <Button
                onClick={generateStory}
                disabled={isGenerating || storyElements.every((el) => el.trim() === "")}
                className="w-full text-lg py-6 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white rounded-xl shadow-lg"
              >
                {isGenerating ? (
                  <div className="flex items-center gap-2">
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                    Writing Your Story...
                  </div>
                ) : (
                  <div className="flex items-center gap-2">
                    <Sparkles className="h-5 w-5" />
                    Create My Story!
                  </div>
                )}
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Generated Story Display */}
        {generatedStory && (
          <Card className="shadow-lg border-0 bg-white/90 backdrop-blur-sm">
            <CardHeader>
              <CardTitle className="text-2xl text-purple-700 flex items-center gap-2">
                <BookOpen className="h-6 w-6" />
                Your Magical Story
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="prose prose-lg max-w-none">
                <div className="text-gray-800 leading-relaxed whitespace-pre-line text-base md:text-lg">
                  {generatedStory}
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Generated Images */}
        {(generatedImages.length > 0 || isGeneratingImages) && (
          <Card className="shadow-lg border-0 bg-white/90 backdrop-blur-sm">
            <CardHeader>
              <CardTitle className="text-2xl text-purple-700">
                Story Illustrations
              </CardTitle>
              {isGeneratingImages && (
                <p className="text-sm text-purple-600 font-medium flex items-center gap-2">
                  <div className="animate-spin rounded-full h-3 w-3 border-b-2 border-purple-600"></div>
                  Creating beautiful illustrations for your story...
                </p>
              )}
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {generatedImages.map((image, index) => (
                  <div key={index} className="space-y-2">
                    <div 
                      className="aspect-[4/3] rounded-xl overflow-hidden shadow-md bg-gradient-to-br from-purple-100 to-pink-100 cursor-pointer transform hover:scale-105 transition-transform duration-200"
                      onClick={() => openImageModal(image, index)}
                    >
                      <img
                        src={image || "/placeholder.svg"}
                        alt={`Story illustration ${index + 1}`}
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <p className="text-sm text-gray-600 text-center font-medium">
                      Illustration {index + 1} 
                      <span className="text-xs text-gray-400 block">Click to enlarge</span>
                    </p>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Image Modal */}
      {expandedImage && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 p-4"
          onClick={closeImageModal}
        >
          <div className="relative max-w-4xl max-h-full w-full h-full flex items-center justify-center">
            <img
              src={expandedImage}
              alt={`Story illustration ${(expandedImageIndex || 0) + 1} - Expanded view`}
              className="max-w-full max-h-full object-contain rounded-lg shadow-2xl"
              onClick={(e) => e.stopPropagation()}
            />
            
            {/* Close Button */}
            <button
              onClick={closeImageModal}
              className="absolute top-4 right-4 bg-white bg-opacity-20 hover:bg-opacity-30 text-white rounded-full p-2 transition-all duration-200"
              aria-label="Close image"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>

            {/* Image Info */}
            <div className="absolute bottom-4 left-4 right-4 text-center">
              <div className="bg-black bg-opacity-50 text-white px-4 py-2 rounded-lg">
                <p className="text-sm font-medium">
                  Illustration {(expandedImageIndex || 0) + 1} of {generatedImages.length}
                </p>
                <p className="text-xs opacity-75 mt-1">
                  Click anywhere outside the image or press ESC to close
                </p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

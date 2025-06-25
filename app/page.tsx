"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Plus, Minus, Sparkles, BookOpen } from "lucide-react"

export default function StoryBuilder() {
  const [storyElements, setStoryElements] = useState(["", "", ""])
  const [generatedStory, setGeneratedStory] = useState("")
  const [generatedImages, setGeneratedImages] = useState<string[]>([])
  const [isGenerating, setIsGenerating] = useState(false)

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

    // Simulate story generation
    setTimeout(() => {
      const elements = storyElements.filter((el) => el.trim() !== "")
      const sampleStory = `Once upon a time, in a magical land far away, there lived a brave little ${elements[0] || "hero"}. 

Every day, they would explore the enchanted forest where ${elements[1] || "magical creatures"} lived in harmony. The trees whispered ancient secrets, and the flowers sang beautiful melodies that filled the air with joy.

One sunny morning, our hero discovered ${elements[2] || "a mysterious treasure"} hidden beneath a rainbow waterfall. This discovery would change their life forever, leading them on the most incredible adventure they could ever imagine.

As they held the precious find in their hands, they realized that the real magic wasn't in what they found, but in the courage they discovered within themselves. From that day forward, they became known throughout the land as the bravest and kindest soul anyone had ever met.

And they all lived happily ever after, sharing their adventures with friends and family, inspiring others to be brave and kind too.`

      setGeneratedStory(sampleStory)
      setGeneratedImages([
        "/placeholder.svg?height=300&width=400",
        "/placeholder.svg?height=300&width=400",
        "/placeholder.svg?height=300&width=400",
      ])
      setIsGenerating(false)
    }, 2000)
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-100 via-pink-50 to-blue-100 p-4">
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
                    Creating Your Story...
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
        {generatedImages.length > 0 && (
          <Card className="shadow-lg border-0 bg-white/90 backdrop-blur-sm">
            <CardHeader>
              <CardTitle className="text-2xl text-purple-700">Story Illustrations</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {generatedImages.map((image, index) => (
                  <div key={index} className="space-y-2">
                    <div className="aspect-[4/3] rounded-xl overflow-hidden shadow-md bg-gradient-to-br from-purple-100 to-pink-100">
                      <img
                        src={image || "/placeholder.svg"}
                        alt={`Story illustration ${index + 1}`}
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <p className="text-sm text-gray-600 text-center font-medium">Illustration {index + 1}</p>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  )
}

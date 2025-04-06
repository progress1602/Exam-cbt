"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent } from "@/components/ui/card"
import { ChevronDown, ChevronUp, Search, ArrowUpDown, User, BookOpen, GraduationCap } from "lucide-react"
import Loading from "./Loading"

type SubjectScore = {
  subject: string
  score: number
}

type Student = {
  id: number
  name: string
  score: number
  subjectScores: SubjectScore[] // Updated to use subjectScores instead of subjects
  course: string
}

type SortField = "name" | "score" | "course"

export function Leaderboard() {
  const [students, setStudents] = useState<Student[]>([])
  const [searchTerm, setSearchTerm] = useState("")
  const [sortField, setSortField] = useState<SortField>("score")
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("desc")
  const [viewMode, setViewMode] = useState<"table" | "cards">("table")
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const API_URL = process.env.NEXT_PUBLIC_API_URL || "";

 
  useEffect(() => {
    const fetchLeaderboard = async () => {
      try {
        const response = await fetch(API_URL, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            query: `
              query {
                getCompetitionLeaderboard {
                  rank
                  score
                  subjectScores {
                    subject
                    score
                  }
                  student {
                    id
                    firstName
                    lastName
                    studentType
                  }
                }
              }
            `,
          }),
        })

        const result = await response.json()
        if (!response.ok || result.errors) {
          throw new Error(result.errors?.[0]?.message || "Failed to fetch leaderboard")
        }

       
        const fetchedStudents: Student[] = result.data.getCompetitionLeaderboard.map((entry: any) => ({
          id: entry.student.id,
          name: `${entry.student.firstName} ${entry.student.lastName}`,
          score: entry.score,
          subjectScores: entry.subjectScores.map((ss: any) => ({
            subject: ss.subject,
            score: ss.score,
          })),
          course: entry.student.studentType,
        }))

        setStudents(fetchedStudents)
        setLoading(false)
      } catch (err) {
        setError(err instanceof Error ? err.message : "An error occurred")
        setLoading(false)
      }
    }

    fetchLeaderboard()
  }, [])

  // Handle search
  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value)
  }

  // Handle sorting
  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortDirection(sortDirection === "asc" ? "desc" : "asc")
    } else {
      setSortField(field)
      setSortDirection("desc")
    }
  }

  // Filter and sort students
  const filteredAndSortedStudents = students
    .filter(
      (student) =>
        student.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        student.course.toLowerCase().includes(searchTerm.toLowerCase()) ||
        student.subjectScores.some((ss) => ss.subject.toLowerCase().includes(searchTerm.toLowerCase())),
    )
    .sort((a, b) => {
      if (sortField === "score") {
        return sortDirection === "asc" ? a.score - b.score : b.score - a.score
      } else {
        const valueA = a[sortField].toLowerCase()
        const valueB = b[sortField].toLowerCase()

        if (valueA < valueB) return sortDirection === "asc" ? -1 : 1
        if (valueA > valueB) return sortDirection === "asc" ? 1 : -1
        return 0
      }
    })

  // Get score color based on value
  const getScoreColor = (score: number) => {
    if (score >= 95) return "text-green-600"
    if (score >= 90) return "text-emerald-600"
    if (score >= 85) return "text-amber-600"
    return "text-gray-600"
  }

  // Get course badge style
  const getCourseBadgeStyle = (course: string) => {
    return course === "Science"
      ? "bg-blue-100 text-blue-800 hover:bg-blue-100"
      : "bg-amber-100 text-amber-800 hover:bg-amber-100"
  }

  // Loading and error states
  if (loading) {
    return <div className="text-center py-8 mt-56 md:mt-56"><Loading/></div>
  }

  if (error) {
    return <div className="text-center py-8 text-red-600">Error: {error}</div>
  }

  return (
    <div className="space-y-4 ">
      <div className="flex flex-col sm:flex-row gap-4 items-center justify-between mx-auto max-w-5xl p-4">
        <div className="relative w-full sm:w-64">
          <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input placeholder="Search students..." className="pl-8" value={searchTerm} onChange={handleSearch} />
        </div>
        <div className="flex flex-wrap gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setSortDirection("asc")}
            className={sortDirection === "asc" ? "bg-secondary" : ""}
          >
            <ChevronUp className="h-4 w-4 mr-1" /> Ascending
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setSortDirection("desc")}
            className={sortDirection === "desc" ? "bg-secondary" : ""}
          >
            <ChevronDown className="h-4 w-4 mr-1" /> Descending
          </Button>
          <Button variant="outline" size="sm" onClick={() => setViewMode(viewMode === "table" ? "cards" : "table")}>
            {viewMode === "table" ? "Card View" : "Table View"}
          </Button>
        </div>
      </div>
        
      <header className="mb-8 text-center">
        <h1 className="text-3xl font-bold mb-2">Student Leaderboard</h1>
        <p className="text-muted-foreground">Track student performance across Science and Art courses</p>
      </header>

      {/* Table View (for larger screens) */}
      {viewMode === "table" && (
        <div className="rounded-md border overflow-x-auto mx-auto max-w-5xl p-4">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-[50px]">Rank</TableHead>
                <TableHead className="min-w-[150px]">
                  <Button
                    variant="ghost"
                    onClick={() => handleSort("name")}
                    className="flex items-center p-0 h-auto font-bold"
                  >
                    Name
                    <ArrowUpDown className={`ml-1 h-4 w-4 ${sortField === "name" ? "opacity-100" : "opacity-50"}`} />
                  </Button>
                </TableHead>
                <TableHead className="w-[100px]">
                  <Button
                    variant="ghost"
                    onClick={() => handleSort("score")}
                    className="flex items-center p-0 h-auto font-bold"
                  >
                    Score
                    <ArrowUpDown className={`ml-1 h-4 w-4 ${sortField === "score" ? "opacity-100" : "opacity-50"}`} />
                  </Button>
                </TableHead>
                <TableHead className="hidden md:table-cell w-[280px]">Subjects</TableHead>
                <TableHead>
                  <Button
                    variant="ghost"
                    onClick={() => handleSort("course")}
                    className="flex items-center p-0 h-auto font-bold"
                  >
                    Course
                    <ArrowUpDown className={`ml-1 h-4 w-4 ${sortField === "course" ? "opacity-100" : "opacity-50"}`} />
                  </Button>
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredAndSortedStudents.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={5} className="text-center py-8 text-muted-foreground">
                    No students found matching your search.
                  </TableCell>
                </TableRow>
              ) : (
                filteredAndSortedStudents.map((student, index) => (
                  <TableRow key={student.id}>
                    <TableCell className="font-medium">{index + 1}</TableCell>
                    <TableCell>{student.name}</TableCell>
                    <TableCell>
                      <span className={`font-semibold ${getScoreColor(student.score)}`}>{student.score}</span>
                    </TableCell>
                    <TableCell className="hidden md:table-cell max-w-[280px]">
                      <div className="grid grid-cols-2 gap-1">
                        {student.subjectScores.map((ss, i) => (
                          <Badge
                            key={i}
                            variant="outline"
                            className={`whitespace-nowrap text-xs truncate ${student.course === "Science" ? "bg-blue-50" : "bg-amber-50"}`}
                          >
                            {ss.subject}: {ss.score}
                          </Badge>
                        ))}
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge
                        variant={student.course === "Science" ? "default" : "secondary"}
                        className={getCourseBadgeStyle(student.course)}
                      >
                        {student.course}
                      </Badge>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
      )}

      {/* Card View (better for mobile) */}
      {viewMode === "cards" && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mx-auto max-w-6xl p-4">
          {filteredAndSortedStudents.length === 0 ? (
            <div className="col-span-full text-center py-8 text-muted-foreground">
              No students found matching your search.
            </div>
          ) : (
            filteredAndSortedStudents.map((student, index) => (
              <Card
                key={student.id}
                className={`overflow-hidden border-l-4 ${
                  student.course === "Science" ? "border-l-blue-500" : "border-l-amber-500"
                }`}
              >
                <CardContent className="p-4">
                  <div className="flex justify-between items-start mb-3">
                    <div className="flex items-center gap-2">
                      <div className="bg-muted rounded-full h-8 w-8 flex items-center justify-center">
                        <User className="h-4 w-4" />
                      </div>
                      <div>
                        <h3 className="font-semibold">{student.name}</h3>
                        <div className="flex items-center gap-1 text-sm text-muted-foreground">
                          <GraduationCap className="h-3 w-3" />
                          <Badge className={getCourseBadgeStyle(student.course)}>{student.course}</Badge>
                        </div>
                      </div>
                    </div>
                    <div className="flex flex-col items-end">
                      <div className="text-xs text-muted-foreground">Rank</div>
                      <div className="font-bold text-lg">{index + 1}</div>
                    </div>
                  </div>

                  <div className="flex justify-between items-center mb-3">
                    <div className="flex items-center gap-1">
                      <BookOpen className="h-4 w-4 text-muted-foreground" />
                      <span className="text-sm font-medium">Score:</span>
                    </div>
                    <span className={`font-bold text-lg ${getScoreColor(student.score)}`}>{student.score}</span>
                  </div>

                  <div>
                    <div className="text-sm font-medium mb-2">Subjects:</div>
                    <div className="grid grid-cols-2 gap-1">
                      {student.subjectScores.map((ss, i) => (
                        <Badge
                          key={i}
                          variant="outline"
                          className={`whitespace-nowrap text-xs px-2 py-1 ${student.course === "Science" ? "bg-blue-50" : "bg-amber-50"}`}
                        >
                          {ss.subject}: {ss.score}
                        </Badge>
                      ))}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </div>
      )}

      <div className="text-sm text-muted-foreground mx-auto max-w-5xl p-4">
        Showing {filteredAndSortedStudents.length} of {students.length} students
      </div>
    </div>
  )
}
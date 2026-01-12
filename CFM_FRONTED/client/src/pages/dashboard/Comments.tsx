import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Search, MessageSquare, Send, Reply } from "lucide-react";

const mockComments = [
  {
    id: 1,
    fileId: 1,
    fileName: "Syllabus.pdf",
    course: "CS101",
    author: "Dr. Sarah Smith",
    authorRole: "Instructor",
    avatar: "SS",
    text: "Please update the grading rubric section with more details on weightage.",
    time: "2 hours ago",
    replies: [
      { id: 11, author: "Dr. Alan Turing", avatar: "AT", text: "Will update by tomorrow.", time: "1 hour ago" }
    ]
  },
  {
    id: 2,
    fileId: 2,
    fileName: "Lecture 1 - Intro.pptx",
    course: "CS101",
    author: "Prof. Hemingway",
    authorRole: "HOD",
    avatar: "PH",
    text: "Great content! Consider adding slides on practical applications.",
    time: "4 hours ago",
    replies: []
  },
  {
    id: 3,
    fileId: 3,
    fileName: "Project_Guidelines.docx",
    course: "CS101",
    author: "Mike Ross",
    authorRole: "Instructor",
    avatar: "MR",
    text: "Need clarification on submission deadline and format.",
    time: "1 day ago",
    replies: [
      { id: 31, author: "Dr. Alan Turing", avatar: "AT", text: "Deadline extended to Dec 10. Format: PDF only.", time: "12 hours ago" },
      { id: 32, author: "Jane Miller", avatar: "JM", text: "Thanks for the update!", time: "8 hours ago" }
    ]
  }
];

export default function CommentsPage() {
  const [searchTerm, setSearchTerm] = useState("");
  const [replyingTo, setReplyingTo] = useState<number | null>(null);
  const [replyText, setReplyText] = useState("");
  const [comments, setComments] = useState(mockComments);

  const filteredComments = comments.filter(c =>
    c.fileName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    c.course.toLowerCase().includes(searchTerm.toLowerCase()) ||
    c.text.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleReply = (commentId: number) => {
    if (replyText.trim()) {
      setComments(comments.map(c =>
        c.id === commentId
          ? {
              ...c,
              replies: [...c.replies, {
                id: Date.now(),
                author: "Dr. Alan Turing",
                avatar: "AT",
                text: replyText,
                time: "now"
              }]
            }
          : c
      ));
      setReplyText("");
      setReplyingTo(null);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Comments & Discussions</h1>
        <p className="text-muted-foreground mt-1">Collaborate with colleagues on course files and materials.</p>
      </div>

      <div className="flex items-center gap-4">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search comments..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-8"
          />
        </div>
        <Badge variant="outline">{comments.length} Comments</Badge>
      </div>

      <div className="space-y-4">
        {filteredComments.length === 0 ? (
          <Card className="py-12">
            <CardContent className="text-center space-y-3">
              <MessageSquare className="h-12 w-12 text-muted-foreground mx-auto opacity-50" />
              <p className="text-muted-foreground">No comments found.</p>
            </CardContent>
          </Card>
        ) : (
          filteredComments.map((comment) => (
            <Card key={comment.id} className="hover:border-primary/50 transition-colors">
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                  <div className="flex items-start gap-3">
                    <Avatar className="h-8 w-8">
                      <AvatarFallback>{comment.avatar}</AvatarFallback>
                    </Avatar>
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <p className="font-semibold text-sm">{comment.author}</p>
                        <Badge variant="outline" className="text-[10px]">{comment.authorRole}</Badge>
                      </div>
                      <p className="text-xs text-muted-foreground mt-1">
                        On <span className="font-mono font-bold text-primary">{comment.fileName}</span> in {comment.course}
                      </p>
                    </div>
                  </div>
                  <span className="text-xs text-muted-foreground">{comment.time}</span>
                </div>
              </CardHeader>

              <CardContent className="space-y-4">
                <p className="text-sm text-foreground bg-muted/50 p-3 rounded-lg">{comment.text}</p>

                {/* Replies */}
                {comment.replies.length > 0 && (
                  <div className="ml-8 space-y-3 pt-2 border-l-2 border-muted-foreground/20 pl-4">
                    {comment.replies.map((reply) => (
                      <div key={reply.id} className="flex items-start gap-2">
                        <Avatar className="h-6 w-6">
                          <AvatarFallback className="text-[10px]">{reply.avatar}</AvatarFallback>
                        </Avatar>
                        <div className="flex-1">
                          <div className="flex items-center gap-2">
                            <p className="text-xs font-semibold">{reply.author}</p>
                            <span className="text-xs text-muted-foreground">{reply.time}</span>
                          </div>
                          <p className="text-xs text-foreground mt-1 bg-background p-2 rounded border">{reply.text}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                {/* Reply Input */}
                <div className="flex items-center gap-2 pt-2">
                  {replyingTo === comment.id ? (
                    <div className="flex-1 flex gap-2">
                      <Input
                        placeholder="Write a reply..."
                        value={replyText}
                        onChange={(e) => setReplyText(e.target.value)}
                        onKeyPress={(e) => {
                          if (e.key === 'Enter' && !e.shiftKey) {
                            e.preventDefault();
                            handleReply(comment.id);
                          }
                        }}
                        className="text-sm"
                      />
                      <Button
                        size="sm"
                        onClick={() => handleReply(comment.id)}
                        className="bg-blue-600 hover:bg-blue-700"
                        disabled={!replyText.trim()}
                      >
                        <Send className="h-4 w-4" />
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => {
                          setReplyingTo(null);
                          setReplyText("");
                        }}
                      >
                        Cancel
                      </Button>
                    </div>
                  ) : (
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => setReplyingTo(comment.id)}
                      className="text-xs"
                    >
                      <Reply className="h-3 w-3 mr-1" /> Reply
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  );
}

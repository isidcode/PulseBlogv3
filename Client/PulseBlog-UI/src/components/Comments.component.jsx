import { useState, useEffect } from "react";
import { useSelector } from "react-redux";
import toast from "react-hot-toast";
import axiosInstance from "../api/axiosInstance";

const Comments = ({ postId }) => {
    const [comments, setComments] = useState([]);
    const [newComment, setNewComment] = useState("");
    const { isLoggedIn } = useSelector((state) => state.auth);

    const fetchComments = async () => {
        try {
            // Your backend uniquely uses a POST request for fetching comments
            const res = await axiosInstance.post(`/comments/get-comments/${postId}`);
            setComments(res.data.data || []);
        } catch (err) {
            console.error("Failed to fetch comments", err);
        }
    };

    useEffect(() => {
        if (postId) {
            fetchComments();
        }
    }, [postId]);

    const handleCommentSubmit = async (e) => {
        e.preventDefault();
        
        if (!isLoggedIn) return toast.error("Please sign in to comment.");
        if (!newComment.trim()) return toast.error("Comment cannot be empty.");

        try {
            await axiosInstance.post(`/comments/comment/${postId}`, {
                content: newComment
            });
            setNewComment("");
            toast.success("Comment added!");
            fetchComments(); // Refresh the list from the database
        } catch (err) {
            toast.error(err?.response?.data?.message || "Failed to add comment");
        }
    };

    return (
        <div className="mt-12 pt-8 border-t border-grey">
            <h3 className="font-inter text-xl font-bold mb-6">Comments ({comments.length})</h3>
            
            <form onSubmit={handleCommentSubmit} className="flex gap-4 mb-8">
                <input 
                    type="text" 
                    value={newComment}
                    onChange={(e) => setNewComment(e.target.value)}
                    placeholder="Write a comment..."
                    className="input-box w-full"
                />
                <button type="submit" className="btn-dark px-6 py-2">Post</button>
            </form>

            <div className="space-y-6">
                {comments.length === 0 ? (
                    <p className="text-dark-grey text-center">No comments yet. Be the first to share your thoughts!</p>
                ) : (
                    comments.map((c) => (
                        <div key={c._id} className="p-4 bg-grey rounded-xl">
                            <div className="flex justify-between items-center mb-2">
                                <p className="font-medium text-sm capitalize">{c.owner?.username || "User"}</p>
                                <p className="text-xs text-dark-grey">
                                    {new Date(c.createdAt).toLocaleDateString()}
                                </p>
                            </div>
                            <p className="text-dark-grey">{c.content}</p>
                        </div>
                    ))
                )}
            </div>
        </div>
    );
};

export default Comments;
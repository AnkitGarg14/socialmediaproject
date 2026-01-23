import React, { useState, useEffect } from 'react';
import { X } from 'lucide-react';
import moment from 'moment';
import { useAuth } from '@clerk/clerk-react';
import { useSelector } from 'react-redux';
import api from '../api/axios';
import toast from 'react-hot-toast';

const Comments = ({ post, onClose, onCommentChange }) => {
  const [comments, setComments] = useState([]);
  const [newComment, setNewComment] = useState('');
  const [loading, setLoading] = useState(false);
  const currentUser = useSelector((state) => state.user.value);
  const { getToken } = useAuth();

  // Load comments on mount
  useEffect(() => {
    const fetchComments = async () => {
      try {
        const token = await getToken();
        const { data } = await api.post(
          '/api/post/comment/get',
          { postId: post._id },
          { headers: { Authorization: `Bearer ${token}` } }
        );
        if (data.success) {
          setComments(data.comments);
        }
      } catch (error) {
        console.error('Error fetching comments:', error);
      }
    };
    fetchComments();
  }, [post._id, getToken]);

  // Handle add comment
  const handleAddComment = async () => {
    if (!newComment.trim()) {
      toast.error('Comment cannot be empty');
      return;
    }

    try {
      setLoading(true);
      const token = await getToken();
      const { data } = await api.post(
        '/api/post/comment/add',
        { postId: post._id, text: newComment },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      if (data.success) {
        setComments(data.post.comments);
        setNewComment('');
        onCommentChange(data.post.comments.length);
        toast.success('Comment added');
      }
    } catch (error) {
      toast.error(error.message);
    } finally {
      setLoading(false);
    }
  };

  // Handle delete comment
  const handleDeleteComment = async (commentId) => {
    try {
      const token = await getToken();
      const { data } = await api.post(
        '/api/post/comment/delete',
        { postId: post._id, commentId },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      if (data.success) {
        setComments(comments.filter((c) => c._id !== commentId));
        onCommentChange(comments.length - 1);
        toast.success('Comment deleted');
      }
    } catch (error) {
      toast.error(error.message);
    }
  };

  return (
    <div className='fixed inset-0 bg-black/50 flex items-center justify-center z-50'>
      <div className='bg-white rounded-lg max-w-2xl w-full max-h-96 shadow-lg overflow-hidden flex flex-col'>
        {/* Header */}
        <div className='flex items-center justify-between p-4 border-b'>
          <h2 className='text-lg font-bold'>Comments ({comments.length})</h2>
          <button onClick={onClose} className='p-1 hover:bg-gray-100 rounded'>
            <X className='w-5 h-5' />
          </button>
        </div>

        {/* Comments List */}
        <div className='flex-1 overflow-y-auto p-4 space-y-3'>
          {comments.length === 0 ? (
            <p className='text-center text-gray-500 py-8'>No comments yet</p>
          ) : (
            comments.map((comment) => (
              <div key={comment._id} className='flex gap-3 pb-3 border-b'>
                <img
                  src={comment.user?.profile_picture}
                  alt=''
                  className='w-8 h-8 rounded-full'
                />
                <div className='flex-1'>
                  <div className='flex items-center justify-between'>
                    <div>
                      <p className='font-semibold text-sm'>{comment.user?.full_name}</p>
                      <p className='text-xs text-gray-500'>@{comment.user?.username}</p>
                    </div>
                    {comment.user._id === currentUser._id && (
                      <button
                        onClick={() => handleDeleteComment(comment._id)}
                        className='text-red-500 hover:bg-red-50 px-2 py-1 rounded text-xs'
                      >
                        Delete
                      </button>
                    )}
                  </div>
                  <p className='text-sm text-gray-700 mt-1'>{comment.text}</p>
                  <p className='text-xs text-gray-400 mt-1'>
                    {moment(comment.createdAt).fromNow()}
                  </p>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Add Comment */}
        <div className='p-4 border-t bg-gray-50'>
          <div className='flex gap-2'>
            <input
              type='text'
              placeholder='Add a comment...'
              value={newComment}
              onChange={(e) => setNewComment(e.target.value)}
              onKeyPress={(e) => {
                if (e.key === 'Enter' && !loading) handleAddComment();
              }}
              className='flex-1 border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500'
            />
            <button
              onClick={handleAddComment}
              disabled={loading}
              className='bg-indigo-600 hover:bg-indigo-700 disabled:bg-gray-400 text-white px-4 py-2 rounded-md text-sm font-medium'
            >
              {loading ? 'Posting...' : 'Post'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Comments;

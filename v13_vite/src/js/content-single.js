/**
 * content-single.js
 * Handles single content page functionality including WordPress comments
 *
 * Features:
 * - Load and display comments from WordPress REST API
 * - Comment form for authenticated members only
 * - Reply functionality (threaded comments)
 * - Pagination (load more)
 */

import { auth } from './auth.js';
import { commentService } from './services/CommentService.js';

// Configuration
const COMMENTS_PER_PAGE = 10;

// State
let currentPage = 1;
let totalPages = 1;
let postId = null;
let isAuthenticated = false;
let currentUser = null;

// DOM Elements
const commentFormArea = document.getElementById('comment-form-area');
const commentsList = document.getElementById('comments-list');
const commentsCount = document.getElementById('comments-count');
const loadMoreContainer = document.getElementById('load-more-container');
const loadMoreBtn = document.getElementById('load-more-btn');

/**
 * Initialize the page
 */
document.addEventListener('DOMContentLoaded', async () => {
    // Get post ID from URL or data attribute
    postId = getPostId();

    if (!postId) {
        console.warn('No post ID found for comments');
        commentsList.innerHTML = '<div class="comments-empty">Comments unavailable.</div>';
        return;
    }

    // Check authentication status
    isAuthenticated = auth.isLoggedIn();
    if (isAuthenticated) {
        currentUser = auth.getUser();
    }

    // Render comment form area based on auth status
    renderCommentFormArea();

    // Load comments
    await loadComments();

    // Setup load more button
    if (loadMoreBtn) {
        loadMoreBtn.addEventListener('click', loadMoreComments);
    }
});

/**
 * Get post ID from URL query param or page data
 */
function getPostId() {
    // Check URL params first
    const urlParams = new URLSearchParams(window.location.search);
    const idFromUrl = urlParams.get('id') || urlParams.get('post_id');
    if (idFromUrl) return parseInt(idFromUrl, 10);

    // Check data attribute on body or article
    const article = document.querySelector('article[data-post-id]');
    if (article) return parseInt(article.dataset.postId, 10);

    // Check meta tag
    const meta = document.querySelector('meta[name="post-id"]');
    if (meta) return parseInt(meta.content, 10);

    // Fallback: use a default post ID for demo (you'll want to update this)
    // In production, each content page should have its WP post ID
    return 1;
}

/**
 * Render comment form area based on auth status
 */
function renderCommentFormArea() {
    if (!commentFormArea) return;

    if (isAuthenticated) {
        // Show comment form for logged-in members
        commentFormArea.innerHTML = `
            <div class="comment-form-container">
                <h3 class="comment-form-title">Leave a Comment</h3>
                <form id="comment-form">
                    <textarea
                        id="comment-content"
                        class="comment-textarea"
                        placeholder="Share your thoughts..."
                        required
                    ></textarea>
                    <div class="form-status" id="form-status" style="display: none;"></div>
                    <div class="comment-form-actions">
                        <button type="submit" id="submit-comment-btn" class="comment-submit-btn">
                            Post Comment
                        </button>
                    </div>
                </form>
            </div>
        `;

        // Attach form handler
        const form = document.getElementById('comment-form');
        form.addEventListener('submit', handleCommentSubmit);
    } else {
        // Show login prompt for guests
        commentFormArea.innerHTML = `
            <div class="login-prompt">
                <p>Want to join the conversation?</p>
                <p><a href="/login.html?redirect=${encodeURIComponent(window.location.pathname)}">Log in</a> or <a href="/signup.html">create an account</a> to leave a comment.</p>
            </div>
        `;
    }
}

/**
 * Load comments from WordPress API
 */
async function loadComments(append = false) {
    if (!postId) return;

    try {
        if (!append) {
            commentsList.innerHTML = '<div class="comments-loading">Loading comments...</div>';
        }

        const result = await commentService.getComments(postId, {
            page: currentPage,
            perPage: COMMENTS_PER_PAGE,
            order: 'desc'
        });

        totalPages = result.totalPages;

        // Update count
        if (commentsCount) {
            commentsCount.textContent = `${result.total} comment${result.total !== 1 ? 's' : ''}`;
        }

        // Render comments
        if (result.comments.length === 0 && currentPage === 1) {
            commentsList.innerHTML = '<div class="comments-empty">No comments yet. Be the first to share your thoughts!</div>';
        } else {
            const commentsHtml = result.comments.map(comment => renderComment(comment)).join('');

            if (append) {
                commentsList.insertAdjacentHTML('beforeend', commentsHtml);
            } else {
                commentsList.innerHTML = commentsHtml;
            }
        }

        // Show/hide load more button
        updateLoadMoreButton();

    } catch (error) {
        console.error('Failed to load comments:', error);
        commentsList.innerHTML = '<div class="comments-error">Failed to load comments. Please try again later.</div>';
    }
}

/**
 * Load more comments
 */
async function loadMoreComments() {
    if (currentPage >= totalPages) return;

    loadMoreBtn.disabled = true;
    loadMoreBtn.textContent = 'Loading...';

    currentPage++;
    await loadComments(true);

    loadMoreBtn.disabled = false;
    loadMoreBtn.textContent = 'Load More Comments';
}

/**
 * Update load more button visibility
 */
function updateLoadMoreButton() {
    if (loadMoreContainer) {
        loadMoreContainer.style.display = currentPage < totalPages ? 'block' : 'none';
    }
}

/**
 * Render a single comment
 */
function renderComment(comment) {
    const authorName = comment.author_name || 'Anonymous';
    const avatarUrl = comment.author_avatar_urls?.['48'] || null;
    const date = new Date(comment.date).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric'
    });
    const content = comment.content?.rendered || comment.content || '';

    // Check if current user owns this comment
    const isOwner = isAuthenticated && currentUser &&
        (comment.author === currentUser.user_id || comment.author === currentUser.id);

    return `
        <div class="comment" data-comment-id="${comment.id}">
            <div class="comment-header">
                <div class="comment-author">
                    <div class="comment-avatar">
                        ${avatarUrl
            ? `<img src="${avatarUrl}" alt="${authorName}">`
            : `<i class="icofont-user"></i>`
        }
                    </div>
                    <div>
                        <div class="comment-author-name">${escapeHtml(authorName)}</div>
                        <div class="comment-date">${date}</div>
                    </div>
                </div>
            </div>
            <div class="comment-content">${content}</div>
            ${isAuthenticated ? `
                <div class="comment-actions">
                    <button type="button" class="comment-action-btn reply-btn" data-comment-id="${comment.id}">
                        <i class="icofont-reply"></i> Reply
                    </button>
                    ${isOwner ? `
                        <button type="button" class="comment-action-btn delete-btn" data-comment-id="${comment.id}">
                            <i class="icofont-trash"></i> Delete
                        </button>
                    ` : ''}
                </div>
                <div class="reply-form-container" id="reply-form-${comment.id}" style="display: none;"></div>
            ` : ''}
        </div>
    `;
}

/**
 * Handle comment form submission
 */
async function handleCommentSubmit(e) {
    e.preventDefault();

    const contentInput = document.getElementById('comment-content');
    const submitBtn = document.getElementById('submit-comment-btn');
    const formStatus = document.getElementById('form-status');
    const content = contentInput.value.trim();

    if (!content) {
        showFormStatus(formStatus, 'Please enter a comment.', 'error');
        return;
    }

    submitBtn.disabled = true;
    submitBtn.textContent = 'Posting...';
    formStatus.style.display = 'none';

    try {
        await commentService.submitComment({
            post: postId,
            content: content
        });

        // Clear form
        contentInput.value = '';

        // Show success message
        showFormStatus(formStatus, 'Comment submitted! It may appear after moderation.', 'success');

        // Reload comments
        currentPage = 1;
        await loadComments();

    } catch (error) {
        console.error('Failed to submit comment:', error);
        const message = error.response?.data?.message || 'Failed to post comment. Please try again.';
        showFormStatus(formStatus, message, 'error');
    } finally {
        submitBtn.disabled = false;
        submitBtn.textContent = 'Post Comment';
    }
}

/**
 * Show reply form for a comment
 */
function showReplyForm(commentId) {
    const container = document.getElementById(`reply-form-${commentId}`);
    if (!container) return;

    container.style.display = 'block';
    container.innerHTML = `
        <div class="reply-form">
            <textarea
                id="reply-content-${commentId}"
                class="reply-textarea"
                placeholder="Write a reply..."
                required
            ></textarea>
            <div class="reply-form-actions">
                <button type="button" class="reply-cancel-btn" data-comment-id="${commentId}">Cancel</button>
                <button type="button" class="reply-submit-btn" data-comment-id="${commentId}">Reply</button>
            </div>
        </div>
    `;
}

/**
 * Hide reply form
 */
function hideReplyForm(commentId) {
    const container = document.getElementById(`reply-form-${commentId}`);
    if (container) {
        container.style.display = 'none';
        container.innerHTML = '';
    }
}

/**
 * Handle reply submission
 */
async function handleReplySubmit(commentId) {
    const textarea = document.getElementById(`reply-content-${commentId}`);
    const content = textarea?.value.trim();

    if (!content) return;

    const submitBtn = document.querySelector(`.reply-submit-btn[data-comment-id="${commentId}"]`);
    submitBtn.disabled = true;
    submitBtn.textContent = 'Posting...';

    try {
        await commentService.submitComment({
            post: postId,
            content: content,
            parent: commentId
        });

        hideReplyForm(commentId);

        // Reload comments
        currentPage = 1;
        await loadComments();

    } catch (error) {
        console.error('Failed to submit reply:', error);
        alert('Failed to post reply. Please try again.');
    } finally {
        if (submitBtn) {
            submitBtn.disabled = false;
            submitBtn.textContent = 'Reply';
        }
    }
}

/**
 * Handle comment deletion
 */
async function handleDeleteComment(commentId) {
    if (!confirm('Are you sure you want to delete this comment?')) return;

    try {
        await commentService.deleteComment(commentId);

        // Reload comments
        currentPage = 1;
        await loadComments();

    } catch (error) {
        console.error('Failed to delete comment:', error);
        alert('Failed to delete comment. Please try again.');
    }
}

/**
 * Show form status message
 */
function showFormStatus(element, message, type) {
    if (!element) return;
    element.textContent = message;
    element.className = `form-status ${type}`;
    element.style.display = 'block';

    // Auto-hide success messages after 5 seconds
    if (type === 'success') {
        setTimeout(() => {
            element.style.display = 'none';
        }, 5000);
    }
}

/**
 * Escape HTML to prevent XSS
 */
function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

// Event delegation for dynamic elements
document.addEventListener('click', (e) => {
    // Reply button
    if (e.target.closest('.reply-btn')) {
        const btn = e.target.closest('.reply-btn');
        const commentId = btn.dataset.commentId;
        showReplyForm(parseInt(commentId, 10));
    }

    // Cancel reply
    if (e.target.closest('.reply-cancel-btn')) {
        const btn = e.target.closest('.reply-cancel-btn');
        const commentId = btn.dataset.commentId;
        hideReplyForm(parseInt(commentId, 10));
    }

    // Submit reply
    if (e.target.closest('.reply-submit-btn')) {
        const btn = e.target.closest('.reply-submit-btn');
        const commentId = btn.dataset.commentId;
        handleReplySubmit(parseInt(commentId, 10));
    }

    // Delete comment
    if (e.target.closest('.delete-btn')) {
        const btn = e.target.closest('.delete-btn');
        const commentId = btn.dataset.commentId;
        handleDeleteComment(parseInt(commentId, 10));
    }
});

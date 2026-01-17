/**
 * my-comments.js
 * Manage user's comments on content pages
 */

import { auth } from './auth.js';
import { commentService } from './services/CommentService.js';
import { testMode } from './utils/testMode.js';

// Guard: Require authentication (skip in test mode)
if (!testMode.isEnabled()) {
    auth.requireAuth();
}

// Reveal app after auth check
document.getElementById('comments-app').style.display = 'block';

// State
let allComments = [];
let currentPage = 1;
let totalPages = 1;
const perPage = 10;
let editingCommentId = null;

document.addEventListener('DOMContentLoaded', async () => {
    // Setup logout
    document.getElementById('logout-btn').addEventListener('click', (e) => {
        e.preventDefault();
        auth.logout();
    });

    // Setup pagination
    document.getElementById('prev-btn').addEventListener('click', () => {
        if (currentPage > 1) {
            currentPage--;
            loadComments();
        }
    });

    document.getElementById('next-btn').addEventListener('click', () => {
        if (currentPage < totalPages) {
            currentPage++;
            loadComments();
        }
    });

    // Setup edit modal
    document.getElementById('modal-close').addEventListener('click', closeEditModal);
    document.getElementById('edit-cancel').addEventListener('click', closeEditModal);
    document.getElementById('edit-save').addEventListener('click', saveComment);

    // Close modal on overlay click
    document.getElementById('edit-modal').addEventListener('click', (e) => {
        if (e.target.id === 'edit-modal') {
            closeEditModal();
        }
    });

    // Load comments
    await loadComments();
});

async function loadComments() {
    const container = document.getElementById('comments-container');
    container.innerHTML = '<div class="loader-container">Loading comments...</div>';

    // Test mode: use mock data
    if (testMode.isEnabled()) {
        console.log('[TestMode] Loading test comments');
        allComments = testMode.getMockComments();
        totalPages = 1;
        renderComments();
        updatePagination();
        return;
    }

    try {
        const response = await commentService.getMyComments({
            page: currentPage,
            perPage: perPage
        });

        allComments = response.comments || [];
        totalPages = response.totalPages || 1;

        renderComments();
        updatePagination();
    } catch (error) {
        console.error('Failed to load comments:', error);
        container.innerHTML = `
            <div class="empty-state">
                <i class="icofont-exclamation-circle"></i>
                <h3>Failed to Load Comments</h3>
                <p>There was an error loading your comments. Please try again.</p>
                <button class="action-button" onclick="location.reload()">Retry</button>
            </div>
        `;
    }
}

function renderComments() {
    const container = document.getElementById('comments-container');

    if (!allComments || allComments.length === 0) {
        container.innerHTML = `
            <div class="empty-state">
                <i class="icofont-comment"></i>
                <h3>No Comments Yet</h3>
                <p>You haven't posted any comments. Explore our content and join the conversation!</p>
                <a href="content.html" class="action-button">Browse Content</a>
            </div>
        `;
        return;
    }

    container.innerHTML = allComments.map(comment => {
        const date = new Date(comment.date);
        const content = comment.content?.rendered || comment.content || '';
        const status = comment.status || 'approved';

        return `
            <div class="comment-card" data-id="${comment.id}">
                <div class="comment-header">
                    <div>
                        ${comment.post_title || comment.link ?
                            `<a href="${comment.link || '#'}" class="comment-post-link" target="_blank">
                                ${comment.post_title || 'View Post'}
                            </a>` :
                            '<span class="comment-post-link">Comment</span>'
                        }
                        <span class="comment-status status-${status}">${status}</span>
                    </div>
                    <span class="comment-date">${date.toLocaleDateString()} at ${date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                </div>
                <div class="comment-content">${content}</div>
                <div class="comment-actions">
                    <a href="${comment.link || '#'}" class="comment-action" target="_blank">
                        <i class="icofont-external-link"></i> View on Post
                    </a>
                    <a href="#" class="comment-action edit-btn" data-id="${comment.id}">
                        <i class="icofont-edit"></i> Edit
                    </a>
                    <a href="#" class="comment-action delete delete-btn" data-id="${comment.id}">
                        <i class="icofont-trash"></i> Delete
                    </a>
                </div>
            </div>
        `;
    }).join('');

    // Attach event listeners
    container.querySelectorAll('.edit-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
            e.preventDefault();
            const commentId = parseInt(btn.dataset.id);
            openEditModal(commentId);
        });
    });

    container.querySelectorAll('.delete-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
            e.preventDefault();
            const commentId = parseInt(btn.dataset.id);
            deleteComment(commentId);
        });
    });
}

function updatePagination() {
    const pagination = document.getElementById('pagination');
    const prevBtn = document.getElementById('prev-btn');
    const nextBtn = document.getElementById('next-btn');
    const pageInfo = document.getElementById('page-info');

    if (totalPages <= 1) {
        pagination.style.display = 'none';
        return;
    }

    pagination.style.display = 'flex';
    prevBtn.disabled = currentPage <= 1;
    nextBtn.disabled = currentPage >= totalPages;
    pageInfo.textContent = `Page ${currentPage} of ${totalPages}`;
}

function openEditModal(commentId) {
    const comment = allComments.find(c => c.id === commentId);
    if (!comment) return;

    editingCommentId = commentId;

    // Extract text from HTML content
    const content = comment.content?.rendered || comment.content || '';
    const textContent = stripHtml(content);

    document.getElementById('edit-content').value = textContent;
    document.getElementById('edit-modal').classList.add('active');
}

function closeEditModal() {
    editingCommentId = null;
    document.getElementById('edit-content').value = '';
    document.getElementById('edit-modal').classList.remove('active');
}

async function saveComment() {
    if (!editingCommentId) return;

    const saveBtn = document.getElementById('edit-save');
    const content = document.getElementById('edit-content').value.trim();

    if (!content) {
        alert('Comment cannot be empty.');
        return;
    }

    saveBtn.disabled = true;
    saveBtn.textContent = 'Saving...';

    // Test mode: just simulate success
    if (testMode.isEnabled()) {
        console.log('[TestMode] Simulating comment update');
        const index = allComments.findIndex(c => c.id === editingCommentId);
        if (index !== -1) {
            allComments[index].content = { rendered: `<p>${content}</p>` };
        }
        renderComments();
        closeEditModal();
        saveBtn.disabled = false;
        saveBtn.textContent = 'Save Changes';
        return;
    }

    try {
        await commentService.updateComment(editingCommentId, { content });

        // Reload comments to get fresh data
        await loadComments();
        closeEditModal();
    } catch (error) {
        console.error('Failed to update comment:', error);
        alert(error.response?.data?.message || 'Failed to update comment. Please try again.');
    } finally {
        saveBtn.disabled = false;
        saveBtn.textContent = 'Save Changes';
    }
}

async function deleteComment(commentId) {
    if (!confirm('Are you sure you want to delete this comment? This action cannot be undone.')) {
        return;
    }

    // Test mode: just remove from list
    if (testMode.isEnabled()) {
        console.log('[TestMode] Simulating comment delete');
        allComments = allComments.filter(c => c.id !== commentId);
        renderComments();
        return;
    }

    try {
        await commentService.deleteComment(commentId, true); // true = permanent delete

        // Reload comments
        await loadComments();
    } catch (error) {
        console.error('Failed to delete comment:', error);
        alert(error.response?.data?.message || 'Failed to delete comment. Please try again.');
    }
}

function stripHtml(html) {
    const tmp = document.createElement('div');
    tmp.innerHTML = html;
    return tmp.textContent || tmp.innerText || '';
}

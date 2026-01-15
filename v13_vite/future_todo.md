# Future TODO Items

## Form Submission Issues

### Missing Fields in Database
**Status:** Minor Issue  
**Priority:** Low  
**Description:** Some forms are dropping fields when submitted to the database. The forms are working correctly and there is a connection between the frontend and backend, but not all form fields are being saved to the database.

**Affected Forms:**
- TBD (needs investigation to identify which specific forms/fields are affected)

**Next Steps:**
1. Identify which forms are missing fields
2. Check form field mapping in `FormSubmissionService.js`
3. Verify backend API is receiving all fields
4. Check if fields are in `form_data` object vs top-level submission object
5. Fix field mapping or backend storage logic

**Notes:**
- Forms are functional and submitting successfully
- Frontend-backend connection is working
- This is a data persistence issue, not a critical bug

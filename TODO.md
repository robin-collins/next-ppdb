# TODO

Further implementation tasks for the Next.js application next-ppdb.

- [ ] on the animal details page, when you click on the customers card that displays the button 'View Customer', clicking anywhere on that card should take you to the customer details page.\

- [] On the Daily Totals page, when the user changes the selected date from today’s date to a previous or future date, then clicks on an animal’s name to open its details page, and subsequently uses the browser’s back button, the app currently reverts to today’s date instead of maintaining the previously selected date. Update this behavior so that when returning via the back button, the Daily Totals page remembers and restores the user’s last selected date. Additionally, ensure that the sidebar link to the Daily Totals page always defaults to today’s date when accessed directly.

- [x] Add GitHub repository and documentation site links to the header navbar, positioned directly to the left of the yellow datetime pill at the far right. Both links must be configurable using a constants.ts file (e.g., `GITHUB_REPO_URL` and `DOCS_SITE_URL`). Ensure the links maintain consistent styling with existing navbar elements, include appropriate icons (GitHub and Docs), and remain responsive across all screen sizes.

- [ ] Configure the GitHub Actions workflow so that when it builds the container, it automatically tags the build with the release version number.

- [ ] Implement a robust notifications system to log and manage the results of scheduled tasks. Each notification should have a status of "unread," "read," or "archived." The top navigation bar must include a bell icon that visually indicates the presence and type of notifications: a muted monotone color when there are no new alerts, and dynamically updated colors (success, warning, error, or info) corresponding to the latest unread notification type. The notifications page should present two clearly separated and collapsible sections—one for current notifications and another for archived ones—allowing users to view, mark as read, or archive individual notifications. The archive section should be collapsed by default. All configuration data and scheduled task definitions must be stored in a JSON file located on a persistent mounted volume to ensure data preservation across restarts.

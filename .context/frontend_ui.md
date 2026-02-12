# Frontend UI Requirements

## Page: Dashboard (`/`)
- **Components:**
  - `RequestForm`: Inputs for GPU Count (Slider 1-8), Duration (Dropdown).
  - `RequestHistory`: Table showing past requests (ID, Status, Time).
  - `StatusCard`: When a request is active, show a progress bar.
    - If status == 'completed', show "Download Kubeconfig" button.
  - `Login`: Login form with username and password. -> Mock LDAP login with SSO 
  - `Logout`: Logout button.
  - `Profile`: Profile page with user information.
  - `Quota`: Quota page showing current quota.
  - `Request History`: Request history page showing past requests.
  - `Request Form`: Request form with GPU count and duration.
  - `Request Status`: Request status page showing current request status.
  - `Request List`: Request list page showing past requests.
  

- **Layout:**
    - Header: User name (Mock).
    - Footer: NVIDIA logo.
    - Sidebar: Navigation menu.
    - Allow for responsive design with the ability to close and open the sidebar.
    - Streamline the UI to look more like a dashboard.
    - Enable ease of use with low user friction and a simple workflow.

- **Material UI Components:**
    - https://mui.com/material-ui/all-components/
    - https://mui.com/material-ui/getting-started/installation/
    - https://mui.com/material-ui/getting-started/usage/
    - Autocomplete tool: https://mui.com/material-ui/react-autocomplete/
    - Data Grid: https://mui.com/material-ui/react-data-grid/
    - Button: https://mui.com/material-ui/react-button/
    - Modal: https://mui.com/material-ui/react-modal/
    - Progress: https://mui.com/material-ui/react-progress/
    - Snackbar: https://mui.com/material-ui/react-snackbar/
    - Tabs: https://mui.com/material-ui/react-tabs/
    - Tooltip: https://mui.com/material-ui/react-tooltip/
    - Typography: https://mui.com/material-ui/react-typography/
    - Toolpad: https://mui.com/toolpad/ (refrence to compoenents for the fullstack with ingeration and other docs for auth and page containers and breadcrumbs and dialogs)
    - https://www.reddit.com/r/selfhosted/comments/159c9ro/introducing_mui_toolpad_opensource_selfhosted/

## State Management
- Use React Query for polling `GET /requests/{id}`.
- Use Zustand or Context for User Auth (Mock). or Auth0 or Okta or Keycloak or AWS Cognito the user auth is mock, not the focus of this POC just to show its a capability



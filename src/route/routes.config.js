import React from "react";
import { MainLayout } from "../components/Common/MainLayout/mainlayout";
import { AuthenticationLayout } from "../components/Common/AuthLayout/AuthenticationLayout";
import { SignUpContent } from "../components/Authentication/SignUpContent";
import { SignInContent } from "../components/Authentication/SignInContent";
import { LockScreenContent } from "../components/Authentication/LockScreenContent";
import { LogOutContent } from "../components/Authentication/LogOutContent";
import { PasswordChangeContent } from "../components/Authentication/PasswordChangeContent";
import { PasswordResetContent } from "../components/Authentication/PasswordResetContent";
import { SuccessMsgContent } from "../components/Authentication/SuccessMsgContent";
import { ErrorPageContent } from "../components/Authentication/ErrorPageContent";
import { ErrorPageContentOne } from "../components/Authentication/ErrorPageContentOne";
import { TwoStepAuthContent } from "../components/Authentication/TwoStepAuthContent";
import { OfflinePageContent } from "../components/Authentication/OfflinePageContent";
import AuthProtected from "./AuthProtected";
import PublicRoute from "./PublicRoute";
import { ProfilePage } from "../pages/profilePage";
import { ChangePassword } from "../pages/ChangePassword";
import { DashboardPage } from "../pages/dashboardPage";
import { Navigate } from "react-router-dom";
import { PageGroup } from "../pages/PageGroup";
import { PageMaster } from "../pages/PageMaster";
import { CreateRoles } from "../pages/CreateRoles";
import { ManageAccessPage } from "../pages/ManageAccess";
import { NewUser } from "../pages/NewUser";
import { NewUserView } from "../pages/NewUserView";
import { NewUserUpdate } from "../pages/NewUserUpdate";
import { UserDashboardPage } from "../pages/UserDashboardPage";
import { Category } from "../pages/Category";
import { AppUserAdd } from "../pages/AppUserAdd";
import { AppUserManage } from "../pages/AppUserManage";
import { GoogleSearchPage } from "../pages/GoogleSearchPage";
import { SearchLocationPage } from "../pages/SearchLocationPage";
import { AllLocations } from "../pages/AllLocations";
import { GooglePlaceResultsSearch } from "../pages/GooglePlaceResultsSearch";
import { SavedSearchListPage } from "../pages/SavedSearchListPage";
import { SearchResultPage } from "../pages/SearchResultPage";
import { GoogleSearchCreditsCardPage } from "../pages/GoogleSearchCreditsCardPage";
const routes = [
  {
    path: "/",
    element: (
      <AuthProtected>
        <MainLayout />
      </AuthProtected>
    ),
    children: [
      { path: "/", element: <Navigate to="/dashboard" replace /> },
      { path: "page-group", element: <PageGroup /> },
      { path: "page-master", element: <PageMaster /> },
      { path: "create-role", element: <CreateRoles /> },
      {
        path: "Manage-role-access/:roleId/:roleName",
        element: <ManageAccessPage />,
      },

      // routing for user management
      { path: "user", element: <NewUserView /> },
      {
        path: "user",
        children: [
          { path: "add", element: <NewUser /> },
          { path: "update/:id", element: <NewUserUpdate /> },
        ],
      },
      {
        path: "app-user",
        children: [
          { path: "", element: <AppUserManage /> },
          { path: "add", element: <AppUserAdd /> },
          { path: "add/:id", element: <AppUserAdd /> },
        ],
      },

      // routing for google search
      {
        path: "google-search",
        children: [
          { path: "", element: <GoogleSearchPage /> },
          { path: "search", element: <SearchLocationPage /> },
          { path: "locations", element: <AllLocations /> },
          { path:  "search-results/:searchId", element: <GooglePlaceResultsSearch /> },
          { path: "savedsearch", element: <SavedSearchListPage /> },
          { path: "place-results", element: <SearchResultPage /> },
          {path:"search-credits",element:<GoogleSearchCreditsCardPage/>}
        ],
      },

      // routing for master settings
      { path: "category-master", element: <Category /> },

      { path: "dashboard", element: <DashboardPage /> },
      { path: "user-dashboard", element: <UserDashboardPage /> },
      { path: "my-profile", element: <ProfilePage /> },
      { path: "change-password", element: <ChangePassword /> },
    ],
  },

  {
    path: "/auth",
    element: (
      <PublicRoute>
        <AuthenticationLayout />
      </PublicRoute>
    ),
    children: [
      { path: "signup", element: <SignUpContent /> },
      { path: "signin", element: <SignInContent /> },
      { path: "lock-screen", element: <LockScreenContent /> },
      { path: "logout", element: <LogOutContent /> },
      { path: "password-change", element: <PasswordChangeContent /> },
      { path: "password-reset", element: <PasswordResetContent /> },
      { path: "success-message", element: <SuccessMsgContent /> },
      { path: "verification", element: <TwoStepAuthContent /> },
    ],
  },

  { path: "/500-error-page", element: <ErrorPageContentOne /> },
  { path: "404-error-page", element: <ErrorPageContent /> },
  { path: "/offline", element: <OfflinePageContent /> },
];

export default routes;
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import AuthPage from "./pages/Auth";
import HTMLCompiler from "./pages/HTMLCompiler";
import Dashboard from "./pages/Dashboard";
import NotFound from "./pages/NotFound";
import SmtpConfigPage from "./pages/SmtpConfigPage";
import CampaignPage from "./pages/CampaignPage";
import SMSPage from "./pages/SMSPage";
import CampaignDetailsPage from "./pages/CampaignDetailsPage";
import ManageContactsPage from "./pages/ManageContactPage";
import ManageTemplatesPage from "./pages/ManageTemplatesPage";
import ManageCampaignVariablesPage from "./pages/ManageCampaignVariablesPage";
import StartCampaignPage from "./pages/StartCampaignPage";
import CampaignStatsPage from "./pages/CampaignStatsPage";
import SubCampaignInfoPage from "./pages/SubCampaignInfoPage";
import { NavigationProvider } from "./components/Sidebar";

const App = () => {
  return (
    <>
      <NavigationProvider>
        <Routes>
          <Route path="/auth" element={<AuthPage />} />
          <Route path="/" element={<Dashboard />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/smtp-config" element={<SmtpConfigPage />} />
          <Route path="/campaign" element={<CampaignPage />} />
          <Route path="/sms" element={<SMSPage />} />
          <Route path="/campaign/:id" element={<CampaignDetailsPage />} />
          <Route
            path="/campaign/:id/manage-contacts"
            element={<ManageContactsPage />}
          />
          <Route
            path="/campaign/:id/manage-templates"
            element={<ManageTemplatesPage />}
          />
          <Route path="/campaign/:id/stats" element={<CampaignStatsPage />} />

          <Route
            path="/campaign/:id/manage-variables"
            element={<ManageCampaignVariablesPage />}
          />
          <Route path="/campaign/:id/start" element={<StartCampaignPage />} />
          <Route
            path="/sub-campaign-info/:subCampaignId"
            element={<SubCampaignInfoPage />}
          />
          <Route path="/html" element={<HTMLCompiler />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </NavigationProvider>
    </>
  );
};

export default App;

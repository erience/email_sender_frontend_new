import React, { useEffect, useMemo, useRef, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import AppLayout from "../components/DashboardLayout";
import Loader from "../components/Loader";
import DynamicForm from "../components/ui/DynamicForm";
import { getCampaignById } from "../services/campaignServices";
import { getActiveSmtpConfigs } from "../services/smtpServices";
import {
  createSubCampaign,
  updateSubCampaign,
} from "../services/subCampaignServices";
import { getTemplatesByCampaign } from "../services/templateService";
import { getUploadsByCampaign } from "../services/uploadsService";
import toast from "react-hot-toast";
import { FaArrowLeft, FaRocket } from "react-icons/fa";
import {
  FiEye,
  FiUsers,
  FiFileText,
  FiSettings,
  FiClock,
  FiTarget,
  FiMail,
  FiPlay,
  FiSave,
  FiCheckCircle,
  FiAlertCircle,
  FiInfo,
  FiCalendar,
  FiActivity,
  FiUser,
} from "react-icons/fi";
import { useLocation } from "react-router-dom";
import {
  getEventsSummary,
  getUniqueEmailsByEvents,
} from "../services/mailEventService";
import { getSubCampaignById } from "../services/subCampaignServices";

const StartCampaignPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const baseId = location.state?.baseSubCampaignId ?? null;
  const editId = location.state?.editSubCampaignId ?? null;

  const [triggerEvents, setTriggerEvents] = useState([]);
  const [campaign, setCampaign] = useState(null);
  const [smtpOptions, setSmtpOptions] = useState([]);
  const [templates, setTemplates] = useState([]);
  const [uploads, setUploads] = useState([]);
  const [selectedTemplateIds, setSelectedTemplateIds] = useState([]);
  const [selectedUploadIds, setSelectedUploadIds] = useState([]);
  const [totalEmails, setTotalEmails] = useState(0);
  const [loading, setLoading] = useState(true);
  const [previewData, setPreviewData] = useState(null);
  const previewRef = useRef(null);
  const [eventSummary, setEventSummary] = useState([]);
  const [baseSubCampaignData, setBaseSubCampaignData] = useState(null);
  const [uniqueEmailCount, setUniqueEmailCount] = useState(0);

  const formatToDatetimeLocal = (isoString) => {
    const date = new Date(isoString);
    const offset = date.getTimezoneOffset();
    const localDate = new Date(date.getTime() - offset * 60 * 1000);
    return localDate.toISOString().slice(0, 16);
  };

  const memorizedInitialFormValues = useMemo(() => {
    return {
      name: editId ? baseSubCampaignData?.name : "",
      fromName: baseSubCampaignData?.fromName || "",
      fromEmail: baseSubCampaignData?.fromEmail || "",
      replyTo: baseSubCampaignData?.replyTo || "",
      subjects:
        baseSubCampaignData?.subjects.length > 0
          ? baseSubCampaignData?.subjects.join(", ")
          : "",
      smtpConfigId:
        baseSubCampaignData?.smtpConfigId || smtpOptions.length > 0
          ? smtpOptions[0]?.value
          : "N/A",
      triggerEvent: baseSubCampaignData?.triggerEvent || "all",
      scheduledAt: baseSubCampaignData?.scheduledAt
        ? formatToDatetimeLocal(baseSubCampaignData.scheduledAt)
        : "",
      sendWindowStart: baseSubCampaignData?.sendWindowStart || "00:00:00",
      sendWindowEnd: baseSubCampaignData?.sendWindowEnd || "23:59:59",
      rateMode: baseSubCampaignData?.rateMode || "hour",
      rateValue: baseSubCampaignData?.sendRateLimit || "",
      baseSubCampaignId: baseId,
    };
  }, [baseSubCampaignData, smtpOptions, baseId]);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [campaignRes, smtpRes, templatesRes, uploadsRes] =
        await Promise.all([
          getCampaignById(id),
          getActiveSmtpConfigs(),
          getTemplatesByCampaign(id),
          getUploadsByCampaign(id),
        ]);

      setCampaign(campaignRes?.data?.data || null);
      setTemplates(templatesRes?.data?.data || []);
      setUploads(uploadsRes?.data?.data || []);
      setSmtpOptions(
        smtpRes?.data?.data?.map((smtp) => ({
          value: smtp.id,
          label: smtp.smtpName,
        })) || []
      );
    } catch (error) {
      toast.error(
        error?.response?.data?.message || "Failed to load campaign data"
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [id]);

  useEffect(() => {
    const fetchBaseSubCampaignDetails = async () => {
      if (!baseId) return;

      try {
        const [subRes, eventRes] = await Promise.all([
          getSubCampaignById(baseId),
          getEventsSummary(baseId),
        ]);

        const sub = subRes?.data?.data;
        const uploadIds =
          sub?.uploadIds?.map((ids) => {
            return Number(ids);
          }) || [];
        setSelectedUploadIds(uploadIds);
        setEventSummary(eventRes?.data?.data || []);
        setBaseSubCampaignData(sub);
      } catch (error) {
        toast.error(
          error?.response?.data?.message ||
            "Failed to fetch base sub-campaign or events"
        );
        console.log("Failed to fetch base sub-campaign or events", error);
      }
    };

    if (uploads.length > 0) {
      fetchBaseSubCampaignDetails();
    }
  }, [baseId, uploads]);

  useEffect(() => {
    const selected = uploads.filter((u) => selectedUploadIds.includes(u.id));
    const count = selected.reduce((sum, u) => sum + (u.totalRows || 0), 0);
    setTotalEmails(count);
  }, [selectedUploadIds, uploads]);

  useEffect(() => {
    const fetchEditSubCampaign = async () => {
      if (!editId) return;

      try {
        const res = await getSubCampaignById(editId);
        const sub = res?.data?.data;
        setBaseSubCampaignData(sub);
        setSelectedTemplateIds(sub?.templateIds || []);
        setSelectedUploadIds(sub?.uploadIds || []);
        setTriggerEvents(sub?.triggerEvents || []);
      } catch (error) {
        toast.error(
          error?.response?.data?.message ||
            "Failed to load sub-campaign for editing"
        );
        console.error("Edit load error:", error);
      }
    };

    if (templates.length > 0 && uploads.length > 0) {
      fetchEditSubCampaign();
    }
  }, [editId, templates, uploads]);

  const handleCheckboxChange = (id, isChecked, setter) => {
    setter((prev) =>
      isChecked ? [...prev, id] : prev.filter((item) => item !== id)
    );
  };

  const fetchUniqueEmails = async () => {
    if (
      !baseId ||
      !Array.isArray(triggerEvents) ||
      triggerEvents.length === 0
    ) {
      setUniqueEmailCount(0);
      return;
    }

    try {
      const res = await getUniqueEmailsByEvents(baseId, triggerEvents);
      const count = res?.data?.count || 0;
      setUniqueEmailCount(count);
    } catch (error) {
      console.error("Failed to fetch unique email count", error);
      toast.error(
        error?.response?.data?.message || "Could not fetch unique email count."
      );
    }
  };

  const handleView = (htmlContent) => {
    let compiled = htmlContent;

    if (campaign?.variableMap && typeof campaign.variableMap === "object") {
      Object.entries(campaign.variableMap).forEach(([key, value]) => {
        const regex = new RegExp(`\\^\\^${key}\\^\\^`, "g");
        compiled = compiled.replace(regex, value || "");
      });
    }

    const blob = new Blob([compiled], { type: "text/html" });
    const url = URL.createObjectURL(blob);
    window.open(url, "_blank", "noopener,noreferrer");
  };

  const handleSubmit = async (formData) => {
    try {
      const isValid = validateSubjects(formData);
      if (!isValid) {
        return;
      }
      let sendRateLimit = null;

      if (formData.rateMode === "hour") {
        sendRateLimit = Number(formData.rateValue);
      } else if (formData.rateMode === "delay") {
        const delayMs = Number(formData.rateValue);
        if (delayMs > 0) {
          sendRateLimit = Math.floor(3600000 / delayMs);
        }
      }
      const payload = {
        ...formData,
        subjects: formData.subjects === "" ? [] : formData.subjects.split(", "),
        campaignId: Number(id),
        uploadIds: selectedUploadIds,
        templateIds: selectedTemplateIds,
        sendRateLimit,
        baseSubCampaignId: formData.baseSubCampaignId,
        triggerEvents: triggerEvents,
        status: formData.status || "scheduled",
      };
      if (editId) {
        await updateSubCampaign(editId, payload);
        toast.success("Sub-campaign updated successfully!");
      } else {
        await createSubCampaign(payload);
        toast.success("Sub-campaign created successfully!");
      }
      navigate(`/campaign/${id}`);
    } catch (error) {
      console.log(error);
      toast.error(error?.response?.data?.message || "Failed to start campaign");
    }
  };

  const formatDuration = (ms) => {
    const totalSeconds = Math.floor(ms / 1000);
    const hours = Math.floor(totalSeconds / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    const seconds = totalSeconds % 60;
    return `${hours}h ${minutes}m ${seconds}s`;
  };

  const handlePreview = async (formData) => {
    const isValid = validateSubjects(formData);
    if (!isValid) {
      return;
    }
    if (baseId && triggerEvents.length > 0) {
      await fetchUniqueEmails();
    }
    const emailsCount = baseId ? uniqueEmailCount : totalEmails;
    let rateLimit = 0;
    let delayMs = 0;

    if (formData.rateMode === "hour") {
      rateLimit = Number(formData.rateValue);
      delayMs = rateLimit > 0 ? 3600000 / rateLimit : 0;
    } else if (formData.rateMode === "delay") {
      delayMs = Number(formData.rateValue);
      rateLimit = delayMs > 0 ? 3600000 / delayMs : 0;
    }

    const totalDelayMs = delayMs * Math.max(emailsCount - 1, 0);

    const [startH = "00", startM = "00", startS = "00"] =
      formData.sendWindowStart?.split(":") ?? [];
    const [endH = "23", endM = "59", endS = "59"] =
      formData.sendWindowEnd?.split(":") ?? [];

    const windowStartSec =
      parseInt(startH) * 3600 + parseInt(startM) * 60 + parseInt(startS);
    const windowEndSec =
      parseInt(endH) * 3600 + parseInt(endM) * 60 + parseInt(endS);

    const windowDurationMs = (windowEndSec - windowStartSec) * 1000;

    let estimatedEndDate = null;
    const scheduleStart = new Date(formData.scheduledAt);

    if (!isNaN(scheduleStart) && totalDelayMs > 0) {
      const windowStart = new Date(scheduleStart);
      windowStart.setHours(startH, startM, startS, 0);

      const windowEnd = new Date(scheduleStart);
      windowEnd.setHours(endH, endM, endS, 0);

      const canSendToday =
        scheduleStart >= windowStart && scheduleStart <= windowEnd;

      if (canSendToday && windowEnd - scheduleStart >= totalDelayMs) {
        estimatedEndDate = new Date(scheduleStart.getTime() + totalDelayMs);
      } else {
        let remainingMs = totalDelayMs;
        let current = new Date(scheduleStart);

        while (true) {
          current.setDate(current.getDate() + 1);
          const nextWindowStart = new Date(current);
          nextWindowStart.setHours(startH, startM, startS, 0);
          const nextWindowEnd = new Date(current);
          nextWindowEnd.setHours(endH, endM, endS, 0);

          const windowDuration = nextWindowEnd - nextWindowStart;

          if (remainingMs <= windowDuration) {
            estimatedEndDate = new Date(
              nextWindowStart.getTime() + remainingMs
            );
            break;
          }

          remainingMs -= windowDuration;
        }
      }
    }

    setPreviewData({
      formData,
      emailsCount,
      rateLimit,
      delayMs,
      totalSendTimeMs: totalDelayMs,
      sendWindowStart: formData.sendWindowStart,
      sendWindowEnd: formData.sendWindowEnd,
      estimatedEndDate,
    });

    setTimeout(() => {
      previewRef.current?.scrollIntoView({
        behavior: "smooth",
        block: "start",
      });
    }, 100);
  };

  const validateSubjects = (formData) => {
    const selectedTemplates = templates.filter((tpl) =>
      selectedTemplateIds.includes(tpl.id)
    );
    const subjects = selectedTemplates.flatMap((tpl) => tpl.subjects || []);
    if (subjects.length === 0 && !formData.subjects) {
      toast.error(
        "Please select template with subjects or add subjects in form."
      );
      return false;
    }
    return true;
  };

  const getUploadFields = () =>
    uploads
      .filter((u) => selectedUploadIds.includes(u.id))
      .flatMap((u) => u.fields || []);

  useEffect(() => {
    if (!templates.length || !uploads.length) return;
    if (selectedTemplateIds.length === 0) return;

    const validUploadIds = uploads
      .map((upload) => {
        const results = getUploadValidityPerTemplate(upload);
        const isValid = selectedTemplateIds.every((tplId) => {
          const tplResult = results.find((r) => r.templateId === tplId);
          return tplResult?.isValid;
        });
        return { id: upload.id, isValid };
      })
      .filter((u) => u.isValid)
      .map((u) => u.id);

    setSelectedUploadIds((prev) => {
      const filtered = prev.filter((uploadId) =>
        validUploadIds.includes(uploadId)
      );
      if (filtered.length !== prev.length) return filtered;
      return prev;
    });
  }, [selectedTemplateIds, uploads]);

  useEffect(() => {
    if (!templates.length || !uploads.length) return;

    const validTemplateIds = templates
      .map((tpl) => {
        const { isValid } = getTemplateValidityPerUpload(tpl.content);
        return { id: tpl.id, isValid };
      })
      .filter((tpl) => tpl.isValid)
      .map((tpl) => tpl.id);

    setSelectedTemplateIds((prev) => {
      const filtered = prev.filter((tplId) => validTemplateIds.includes(tplId));
      if (filtered.length !== prev.length) return filtered;
      return prev;
    });
  }, [selectedUploadIds, templates]);

  const variableMap = Object.keys(
    campaign?.variableMap ? campaign?.variableMap : {}
  );
  const uploadFields = [...variableMap, ...getUploadFields()];
  const hasUploads = selectedUploadIds.length > 0;

  const extractPlaceholders = (tplContent) => {
    const matches = tplContent.match(/\^\^(\w+)\^\^/g) || [];
    return matches.map((m) => m.replace(/\^\^|\^\^/g, ""));
  };

  const getTemplateValidityPerUpload = (tplContent) => {
    const requiredFields = extractPlaceholders(tplContent);

    const result = uploads
      .filter((u) => selectedUploadIds.includes(u.id))
      .map((upload) => {
        const uploadFieldSet = new Set([
          ...(upload.fields || []),
          ...Object.keys(campaign?.variableMap || {}),
        ]);
        const missingFields = requiredFields.filter(
          (field) => !uploadFieldSet.has(field)
        );
        return {
          uploadId: upload.id,
          uploadName: upload.uploadName,
          isValid: missingFields.length === 0,
          missingFields,
        };
      });

    const overallValid = result.every((r) => r.isValid);

    return {
      isValid: overallValid,
      perUpload: result,
    };
  };

  const getUploadValidityPerTemplate = (upload) => {
    const uploadFieldSet = new Set([
      ...(upload.fields || []),
      ...Object.keys(campaign?.variableMap || {}),
    ]);

    return templates.map((tpl) => {
      const requiredFields = extractPlaceholders(tpl.content);
      const missingFields = requiredFields.filter(
        (field) => !uploadFieldSet.has(field)
      );
      return {
        templateId: tpl.id,
        templateName: tpl.templateName,
        isValid: missingFields.length === 0,
        missingFields,
      };
    });
  };

  const isUploadCompatible = (upload) => {
    const result = getUploadValidityPerTemplate(upload);
    return result
      .filter((tpl) => selectedTemplateIds.includes(tpl.templateId))
      .every((tpl) => tpl.isValid);
  };

  const formConfig = [
    {
      name: "name",
      label: "Sub-campaign Name",
      type: "text",
      required: true,
      grid: 6,
      placeholder: "Enter sub-campaign name",
      helpText: "A descriptive name for this sub-campaign",
    },
    {
      name: "fromName",
      label: "From Name",
      type: "text",
      required: true,
      grid: 6,
      placeholder: "John Doe",
      helpText: "The sender name recipients will see",
    },
    {
      name: "fromEmail",
      label: "From Email",
      type: "email",
      required: true,
      grid: 6,
      placeholder: "sender@example.com",
      helpText: "The sender email address",
    },
    {
      name: "replyTo",
      label: "Reply-To Email",
      type: "email",
      required: true,
      grid: 6,
      placeholder: "reply@example.com",
      helpText: "Where replies will be sent",
    },
    {
      name: "subjects",
      label: "Email Subjects",
      type: "text",
      required: false,
      grid: 6,
      placeholder: "Subject line for emails",
      helpText: "Subject line if not using template subjects",
    },
    {
      name: "smtpConfigId",
      label: "SMTP Configuration",
      type: "select",
      required: true,
      grid: 6,
      options:
        smtpOptions.length > 0
          ? smtpOptions
          : [{ value: "N/A", label: "No Active SMTPs" }],
      helpText: "Select SMTP server for sending emails",
    },
    // {
    //   name: "triggerEvent",
    //   label: "Trigger Event",
    //   type: "select",
    //   required: true,
    //   grid: 6,
    //   options: [
    //     { label: "All Recipients", value: "all" },
    //     { label: "Only Opened", value: "opened" },
    //     { label: "Only Not Opened", value: "not_opened" },
    //     { label: "Only Clicked", value: "clicked" },
    //     { label: "Only Not Clicked", value: "not_clicked" },
    //   ],
    //   helpText: "Which recipients to target",
    // },
    {
      name: "scheduledAt",
      label: "Schedule Time",
      type: "datetime-local",
      required: true,
      grid: 6,
      helpText: "When to start sending emails",
    },
    {
      name: "sendWindowStart",
      label: "Send Window Start",
      type: "time",
      required: false,
      grid: 6,
      helpText: "Daily start time for sending",
    },
    {
      name: "sendWindowEnd",
      label: "Send Window End",
      type: "time",
      required: false,
      grid: 6,
      helpText: "Daily end time for sending",
    },
    {
      name: "rateMode",
      label: "Rate Limiting Mode",
      type: "select",
      required: true,
      grid: 6,
      options: [
        { label: "Emails per Hour", value: "hour" },
        { label: "Delay Between Emails (ms)", value: "delay" },
      ],
      helpText: "How to control sending rate",
    },
    {
      name: "rateValue",
      label: "Rate Limit Value",
      type: "number",
      required: false,
      grid: 6,
      placeholder: "100",
      helpText: "Rate limit value based on selected mode",
    },
  ].filter(Boolean);

  if (loading) return <Loader />;

  return (
    <AppLayout>
      <div className="p-6 space-y-8">
        {/* Breadcrumb Navigation */}
        <nav className="flex items-center space-x-2 text-sm text-gray-600 dark:text-gray-400">
          <button
            onClick={() => navigate(`/campaign/${id}`)}
            className="flex items-center px-3 py-2 rounded-lg hover:bg-white dark:hover:bg-gray-800 hover:shadow-sm transition-all duration-200 group"
          >
            <FaArrowLeft className="w-4 h-4 mr-2 group-hover:-translate-x-1 transition-transform" />
            Campaign Details
          </button>
          <span className="text-gray-400">/</span>
          <span className="text-gray-900 dark:text-white font-semibold">
            {editId ? "Edit Sub-Campaign" : "Create Sub-Campaign"}
          </span>
        </nav>

        {/* Header Section */}
        <div className="bg-white/95 dark:bg-gray-800/95 backdrop-blur-sm rounded-2xl shadow-xl border border-gray-200/60 dark:border-gray-700/60 p-6">
          <div className="flex items-center space-x-4">
            <div className="p-3 bg-gradient-to-br from-blue-100 to-indigo-100 dark:from-blue-900/50 dark:to-indigo-900/50 rounded-xl">
              <FaRocket className="w-8 h-8 text-blue-600 dark:text-blue-400" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
                {editId ? "Edit Sub-Campaign" : "Launch Sub-Campaign"}
              </h1>
              <p className="text-gray-600 dark:text-gray-400 mt-1">
                Configure and launch sub-campaign for "{campaign?.name}"
              </p>
            </div>
          </div>

          {/* Campaign Info */}
          <div className="mt-6 p-4 bg-gradient-to-r from-gray-50 to-blue-50 dark:from-gray-700 dark:to-blue-900/20 rounded-xl border border-gray-200/60 dark:border-gray-600/60">
            <div className="flex items-center space-x-3">
              <FiInfo className="w-5 h-5 text-blue-600 dark:text-blue-400" />
              <div>
                <p className="font-semibold text-gray-900 dark:text-white">
                  {campaign?.name}
                </p>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  {campaign?.description || "No description available"}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Upload Selector */}
        {!baseId && (
          <div className="bg-white/95 dark:bg-gray-800/95 backdrop-blur-sm rounded-2xl shadow-lg border border-gray-200/60 dark:border-gray-700/60 overflow-hidden">
            <div className="bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 p-6 border-b border-gray-200/60 dark:border-gray-700/60">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className="p-2 bg-gradient-to-br from-green-500 to-emerald-600 rounded-xl shadow-lg">
                    <FiUsers className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-gray-900 dark:text-white">
                      Select Contact Lists
                    </h3>
                    <p className="text-gray-600 dark:text-gray-400 text-sm">
                      Choose which contact lists to include in this campaign
                    </p>
                  </div>
                </div>
                <div className="bg-white/80 dark:bg-gray-700/80 backdrop-blur-sm px-4 py-2 rounded-xl border border-green-200 dark:border-green-700">
                  <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                    Total:{" "}
                    <span className="font-bold text-green-600 dark:text-green-400">
                      {totalEmails.toLocaleString()}
                    </span>{" "}
                    contacts
                  </span>
                </div>
              </div>
            </div>

            <div className="p-6">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {uploads.map((upload) => {
                  const isCompatible = isUploadCompatible(upload);
                  const validityResults = getUploadValidityPerTemplate(upload);
                  const incompatibleTemplates = validityResults.filter(
                    (tpl) =>
                      selectedTemplateIds.includes(tpl.templateId) &&
                      !tpl.isValid
                  );

                  return (
                    <label
                      key={upload.id}
                      className={`group relative p-6 border-2 rounded-2xl cursor-pointer transition-all duration-200 ${
                        selectedUploadIds.includes(upload.id)
                          ? "border-green-300 bg-green-50/50 dark:border-green-700 dark:bg-green-900/20"
                          : isCompatible
                          ? "border-gray-200 dark:border-gray-600 hover:border-green-300 dark:hover:border-green-700 hover:bg-green-50/30 dark:hover:bg-green-900/10"
                          : "border-red-200 dark:border-red-700 bg-red-50/30 dark:bg-red-900/10 opacity-60 cursor-not-allowed"
                      }`}
                    >
                      <div className="flex items-start space-x-4">
                        <input
                          type="checkbox"
                          checked={selectedUploadIds.includes(upload.id)}
                          onChange={(e) =>
                            handleCheckboxChange(
                              upload.id,
                              e.target.checked,
                              setSelectedUploadIds
                            )
                          }
                          disabled={
                            !isCompatible && selectedTemplateIds.length > 0
                          }
                          className="mt-2 w-5 h-5 text-green-600 bg-gray-100 border-gray-300 rounded focus:ring-green-500 dark:focus:ring-green-600 dark:ring-offset-gray-800 focus:ring-2 dark:bg-gray-700 dark:border-gray-600"
                        />

                        <div className="flex-1 min-w-0">
                          <div className="flex items-center space-x-3 mb-3">
                            <div className="p-2 bg-gradient-to-br from-blue-100 to-indigo-100 dark:from-blue-900/50 dark:to-indigo-900/50 rounded-lg">
                              <FiUsers className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                            </div>
                            <h4 className="font-semibold text-gray-900 dark:text-white truncate">
                              {upload.fileName || upload.uploadName}
                            </h4>
                          </div>

                          {upload.remarks && (
                            <p className="text-sm text-gray-600 dark:text-gray-400 mb-3 italic">
                              {upload.remarks}
                            </p>
                          )}

                          <div className="grid grid-cols-2 gap-4 mb-3">
                            <div className="bg-blue-50 dark:bg-blue-900/20 p-3 rounded-lg">
                              <p className="text-xs text-blue-600 dark:text-blue-400 font-medium">
                                Total Rows
                              </p>
                              <p className="text-lg font-bold text-blue-700 dark:text-blue-300">
                                {upload.totalRows?.toLocaleString() || 0}
                              </p>
                            </div>
                            <div className="bg-red-50 dark:bg-red-900/20 p-3 rounded-lg">
                              <p className="text-xs text-red-600 dark:text-red-400 font-medium">
                                Invalid Rows
                              </p>
                              <p className="text-lg font-bold text-red-700 dark:text-red-300">
                                {upload.invalidRows?.toLocaleString() || 0}
                              </p>
                            </div>
                          </div>

                          <div className="mb-3">
                            <p className="text-xs font-medium text-gray-700 dark:text-gray-300 mb-2">
                              Available Fields:
                            </p>
                            <div className="flex flex-wrap gap-1">
                              {(upload.fields || [])
                                .slice(0, 5)
                                .map((field, index) => (
                                  <span
                                    key={index}
                                    className="inline-flex items-center px-2 py-1 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 text-xs rounded-md"
                                  >
                                    {field}
                                  </span>
                                ))}
                              {(upload.fields || []).length > 5 && (
                                <span className="inline-flex items-center px-2 py-1 bg-gray-200 dark:bg-gray-600 text-gray-600 dark:text-gray-400 text-xs rounded-md">
                                  +{(upload.fields || []).length - 5} more
                                </span>
                              )}
                            </div>
                          </div>

                          {incompatibleTemplates.length > 0 && (
                            <div className="bg-red-50 dark:bg-red-900/20 p-3 rounded-lg border border-red-200 dark:border-red-700">
                              <div className="flex items-center space-x-2 mb-2">
                                <FiAlertCircle className="w-4 h-4 text-red-600 dark:text-red-400" />
                                <p className="text-sm font-medium text-red-800 dark:text-red-200">
                                  Compatibility Issues
                                </p>
                              </div>
                              {incompatibleTemplates.map((tpl) => (
                                <div
                                  key={tpl.templateId}
                                  className="text-xs text-red-700 dark:text-red-300 mb-1"
                                >
                                  <strong>{tpl.templateName}:</strong> Missing
                                  fields: {tpl.missingFields.join(", ")}
                                </div>
                              ))}
                            </div>
                          )}
                        </div>
                      </div>
                    </label>
                  );
                })}
              </div>
            </div>
          </div>
        )}

        {/* Event Segment Selector */}
        {baseId && eventSummary.length > 0 && (
          <div className="bg-white/95 dark:bg-gray-800/95 backdrop-blur-sm rounded-2xl shadow-lg border border-gray-200/60 dark:border-gray-700/60 overflow-hidden">
            <div className="bg-gradient-to-r from-purple-50 to-pink-50 dark:from-purple-900/20 dark:to-pink-900/20 p-6 border-b border-gray-200/60 dark:border-gray-700/60">
              <div className="flex items-center space-x-3">
                <div className="p-2 bg-gradient-to-br from-purple-500 to-pink-600 rounded-xl shadow-lg">
                  <FiTarget className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h3 className="text-xl font-bold text-gray-900 dark:text-white">
                    Target Event Segments
                  </h3>
                  <p className="text-gray-600 dark:text-gray-400 text-sm">
                    Select specific user events to target (e.g., users who
                    opened or clicked)
                  </p>
                </div>
              </div>
            </div>

            <div className="p-6">
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {eventSummary.map((event) => (
                  <label
                    key={event.eventName}
                    className="group flex items-center space-x-3 p-4 border border-gray-200 dark:border-gray-600 rounded-xl hover:border-purple-300 dark:hover:border-purple-700 hover:bg-purple-50/30 dark:hover:bg-purple-900/10 cursor-pointer transition-all duration-200"
                  >
                    <input
                      type="checkbox"
                      checked={
                        Array.isArray(triggerEvents) &&
                        triggerEvents.includes(event.eventName)
                      }
                      onChange={(e) => {
                        const isChecked = e.target.checked;
                        setTriggerEvents((prev) => {
                          const safePrev = Array.isArray(prev) ? prev : [];
                          return isChecked
                            ? [...safePrev, event.eventName]
                            : safePrev.filter((ev) => ev !== event.eventName);
                        });
                      }}
                      className="w-5 h-5 text-purple-600 bg-gray-100 border-gray-300 rounded focus:ring-purple-500 dark:focus:ring-purple-600 dark:ring-offset-gray-800 focus:ring-2 dark:bg-gray-700 dark:border-gray-600"
                    />
                    <div className="flex-1">
                      <p className="font-medium text-gray-900 dark:text-white capitalize">
                        {event.eventName.replace(/_/g, " ")}
                      </p>
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        {event.count.toLocaleString()} users
                      </p>
                    </div>
                  </label>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Template Selector */}
        <div className="bg-white/95 dark:bg-gray-800/95 backdrop-blur-sm rounded-2xl shadow-lg border border-gray-200/60 dark:border-gray-700/60 overflow-hidden">
          <div className="bg-gradient-to-r from-indigo-50 to-purple-50 dark:from-indigo-900/20 dark:to-purple-900/20 p-6 border-b border-gray-200/60 dark:border-gray-700/60">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-xl shadow-lg">
                <FiFileText className="w-6 h-6 text-white" />
              </div>
              <div>
                <h3 className="text-xl font-bold text-gray-900 dark:text-white">
                  Select Email Templates
                </h3>
                <p className="text-gray-600 dark:text-gray-400 text-sm">
                  Choose templates for your email campaign
                </p>
              </div>
            </div>
          </div>

          <div className="p-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 max-h-96 overflow-y-auto">
              {templates.map((tpl) => {
                const { isValid: valid, perUpload } =
                  getTemplateValidityPerUpload(tpl.content);
                const isDisabled = !valid;
                const subjectsCount = tpl.subjects ? tpl.subjects.length : 0;

                return (
                  <label
                    key={tpl.id}
                    className={`group relative p-6 border-2 rounded-2xl cursor-pointer transition-all duration-200 ${
                      selectedTemplateIds.includes(tpl.id)
                        ? "border-indigo-300 bg-indigo-50/50 dark:border-indigo-700 dark:bg-indigo-900/20"
                        : isDisabled
                        ? "border-red-200 dark:border-red-700 bg-red-50/30 dark:bg-red-900/10 opacity-60 cursor-not-allowed"
                        : "border-gray-200 dark:border-gray-600 hover:border-indigo-300 dark:hover:border-indigo-700 hover:bg-indigo-50/30 dark:hover:bg-indigo-900/10"
                    }`}
                  >
                    <div className="flex items-start space-x-4">
                      <input
                        type="checkbox"
                        checked={selectedTemplateIds.includes(tpl.id)}
                        onChange={(e) =>
                          handleCheckboxChange(
                            tpl.id,
                            e.target.checked,
                            setSelectedTemplateIds
                          )
                        }
                        disabled={isDisabled}
                        className="mt-2 w-5 h-5 text-indigo-600 bg-gray-100 border-gray-300 rounded focus:ring-indigo-500 dark:focus:ring-indigo-600 dark:ring-offset-gray-800 focus:ring-2 dark:bg-gray-700 dark:border-gray-600"
                      />

                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between mb-3">
                          <div className="flex items-center space-x-3">
                            <div className="p-2 bg-gradient-to-br from-purple-100 to-pink-100 dark:from-purple-900/50 dark:to-pink-900/50 rounded-lg">
                              <FiFileText className="w-4 h-4 text-purple-600 dark:text-purple-400" />
                            </div>
                            <h4 className="font-semibold text-gray-900 dark:text-white truncate">
                              {tpl.templateName}
                            </h4>
                          </div>

                          <div className="flex items-center space-x-2">
                            <span className="inline-flex items-center px-2 py-1 bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 text-xs rounded-md">
                              {subjectsCount} subject
                              {subjectsCount !== 1 ? "s" : ""}
                            </span>
                            <button
                              type="button"
                              onClick={() => handleView(tpl.content)}
                              className="p-2 rounded-lg bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-600 transition-all duration-200"
                              title="Preview Template"
                            >
                              <FiEye className="w-4 h-4" />
                            </button>
                          </div>
                        </div>

                        <p className="text-sm text-gray-600 dark:text-gray-400 mb-3 line-clamp-2">
                          {tpl.content?.slice(0, 100)}...
                        </p>

                        <p className="text-xs text-gray-500 dark:text-gray-400 mb-3">
                          Created:{" "}
                          {new Date(tpl.createdAt).toLocaleDateString()}
                        </p>

                        {!valid && hasUploads && (
                          <div className="bg-red-50 dark:bg-red-900/20 p-3 rounded-lg border border-red-200 dark:border-red-700">
                            <div className="flex items-center space-x-2 mb-2">
                              <FiAlertCircle className="w-4 h-4 text-red-600 dark:text-red-400" />
                              <p className="text-sm font-medium text-red-800 dark:text-red-200">
                                Missing Fields
                              </p>
                            </div>
                            {perUpload
                              .filter((u) => !u.isValid)
                              .map((u) => (
                                <div
                                  key={u.uploadId}
                                  className="text-xs text-red-700 dark:text-red-300 mb-1"
                                >
                                  <strong>{u.uploadName}:</strong>{" "}
                                  {u.missingFields.join(", ")}
                                </div>
                              ))}
                          </div>
                        )}
                      </div>
                    </div>
                  </label>
                );
              })}
            </div>
          </div>
        </div>

        {/* Campaign Settings Form */}
        <div className="bg-white/95 dark:bg-gray-800/95 backdrop-blur-sm rounded-2xl shadow-lg border border-gray-200/60 dark:border-gray-700/60 overflow-hidden">
          <div className="bg-gradient-to-r from-orange-50 to-red-50 dark:from-orange-900/20 dark:to-red-900/20 p-6 border-b border-gray-200/60 dark:border-gray-700/60">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-gradient-to-br from-orange-500 to-red-600 rounded-xl shadow-lg">
                <FiSettings className="w-6 h-6 text-white" />
              </div>
              <div>
                <h3 className="text-xl font-bold text-gray-900 dark:text-white">
                  Campaign Configuration
                </h3>
                <p className="text-gray-600 dark:text-gray-400 text-sm">
                  Configure sending settings and scheduling options
                </p>
              </div>
            </div>
          </div>

          <div className="p-6">
            <DynamicForm
              initialValues={memorizedInitialFormValues}
              formConfig={formConfig}
              onSubmit={(formData) => handlePreview(formData)}
              onCancel={() => navigate(`/campaign/${id}`)}
              submitText="Preview Campaign"
              backText="Back to Campaign"
            />
          </div>
        </div>

        {/* Preview Section */}
        {previewData && (
          <div
            ref={previewRef}
            className="bg-white/95 dark:bg-gray-800/95 backdrop-blur-sm rounded-2xl shadow-xl border border-gray-200/60 dark:border-gray-700/60 overflow-hidden"
          >
            <div className="bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 p-6 border-b border-gray-200/60 dark:border-gray-700/60">
              <div className="flex items-center space-x-3">
                <div className="p-2 bg-gradient-to-br from-green-500 to-emerald-600 rounded-xl shadow-lg">
                  <FiEye className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h3 className="text-xl font-bold text-gray-900 dark:text-white">
                    Campaign Preview & Launch
                  </h3>
                  <p className="text-gray-600 dark:text-gray-400 text-sm">
                    Review your campaign settings before launching
                  </p>
                </div>
              </div>
            </div>

            <div className="p-6">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Campaign Details */}
                <div className="space-y-4">
                  <h4 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                    Campaign Details
                  </h4>

                  {[
                    {
                      label: "From Name",
                      value: previewData.formData.fromName,
                      icon: <FiUser className="w-4 h-4" />,
                    },
                    {
                      label: "From Email",
                      value: previewData.formData.fromEmail,
                      icon: <FiMail className="w-4 h-4" />,
                    },
                    {
                      label: "Reply To",
                      value: previewData.formData.replyTo,
                      icon: <FiMail className="w-4 h-4" />,
                    },
                    {
                      label: "Subjects",
                      value: previewData.formData.subjects || "From templates",
                      icon: <FiFileText className="w-4 h-4" />,
                    },
                    {
                      label: "Trigger Event",
                      value: previewData.formData.triggerEvent,
                      icon: <FiTarget className="w-4 h-4" />,
                    },
                  ].map((item, index) => (
                    <div
                      key={index}
                      className="flex items-center space-x-3 p-3 bg-gray-50 dark:bg-gray-700 rounded-lg"
                    >
                      <div className="p-2 bg-white dark:bg-gray-800 rounded-lg">
                        {item.icon}
                      </div>
                      <div>
                        <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                          {item.label}
                        </p>
                        <p className="text-gray-900 dark:text-white">
                          {item.value}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Scheduling & Performance */}
                <div className="space-y-4">
                  <h4 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                    Scheduling & Performance
                  </h4>

                  {[
                    {
                      label: "Schedule Time",
                      value: new Date(
                        previewData.formData.scheduledAt
                      ).toLocaleString(),
                      icon: <FiCalendar className="w-4 h-4" />,
                    },
                    {
                      label: "Send Window",
                      value: `${previewData.sendWindowStart} → ${previewData.sendWindowEnd}`,
                      icon: <FiClock className="w-4 h-4" />,
                    },
                    {
                      label: "Total Recipients",
                      value: previewData.emailsCount.toLocaleString(),
                      icon: <FiUsers className="w-4 h-4" />,
                    },
                    {
                      label: "Rate Limit",
                      value:
                        previewData.formData.rateMode === "hour"
                          ? `${previewData.rateLimit.toFixed(0)} emails/hour`
                          : `${previewData.delayMs.toFixed(0)}ms delay`,
                      icon: <FiActivity className="w-4 h-4" />,
                    },
                    {
                      label: "Estimated Duration",
                      value: formatDuration(previewData.totalSendTimeMs),
                      icon: <FiClock className="w-4 h-4" />,
                    },
                    {
                      label: "Estimated Completion",
                      value: previewData.estimatedEndDate
                        ? new Date(
                            previewData.estimatedEndDate
                          ).toLocaleString()
                        : "Immediate",
                      icon: <FiCheckCircle className="w-4 h-4" />,
                    },
                  ].map((item, index) => (
                    <div
                      key={index}
                      className="flex items-center space-x-3 p-3 bg-gray-50 dark:bg-gray-700 rounded-lg"
                    >
                      <div className="p-2 bg-white dark:bg-gray-800 rounded-lg">
                        {item.icon}
                      </div>
                      <div>
                        <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                          {item.label}
                        </p>
                        <p className="text-gray-900 dark:text-white">
                          {item.value}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center justify-end space-x-4 mt-8 pt-6 border-t border-gray-200 dark:border-gray-700">
                <button
                  onClick={() =>
                    handleSubmit({ ...previewData.formData, status: "draft" })
                  }
                  className="flex items-center px-6 py-3 bg-gradient-to-r from-gray-500 to-gray-600 text-white rounded-xl hover:from-gray-600 hover:to-gray-700 focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 transition-all duration-200 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 font-medium"
                >
                  <FiSave className="w-4 h-4 mr-2" />
                  Save as Draft
                </button>
                <button
                  onClick={() =>
                    handleSubmit({
                      ...previewData.formData,
                      status: "scheduled",
                    })
                  }
                  className="flex items-center px-8 py-3 bg-gradient-to-r from-green-500 to-emerald-500 text-white rounded-xl hover:from-green-600 hover:to-emerald-600 focus:ring-2 focus:ring-green-500 focus:ring-offset-2 transition-all duration-200 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 font-medium"
                >
                  <FiPlay className="w-4 h-4 mr-2" />
                  Launch Campaign
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </AppLayout>
  );
};

export default StartCampaignPage;

import { useState, useEffect } from "react";
import { useParams, useNavigate, Link } from "react-router";
import { getRequest, postRequest } from "../../../../API/API";
import { useAuth } from "../../../../authentication/AuthContext";
import NeedsPanel from "../../../../components/graph/NeedsPanel";
import {
  SecondaryStatusChart,
  PrimaryStatusChart
} from "../../../../components/graph/StatusBarChart";

const hasSupplyNeeds = (user) => Boolean(user?.food || user?.water || user?.medical || user?.special_food);
const hasVisibleNeeds = (user) => Boolean(hasSupplyNeeds(user) || user?.allergy);
const formatDateTime = (value) => {
  if (!value) {
    return "Not available";
  }

  return new Date(value).toLocaleString("en-PH");
};

function Listing() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user, loading: authLoading } = useAuth();

  const [list, setList] = useState([]);
  const [distributionRequests, setDistributionRequests] = useState([]);
  const [center, setCenter] = useState(null);
  const [heldSupplies, setHeldSupplies] = useState([]);
  const [heldSupplyLogs, setHeldSupplyLogs] = useState([]);
  const [stats, setStats] = useState({
    totalFamilies: 0,
    totalPeople: 0,
    totalIndividual: 0,
    totalCheckIns: 0,
    totalCheckOuts: 0,
    activeInside: 0,
    foodNeeds: 0,
    medicineNeeds: 0,
    allergyCount: 0,
    specialFoodCount: 0,
    maleCount: 0,
    femaleCount: 0
  });
  const [secondaryStatusData, setSecondaryStatusData] = useState([]);
  const [primaryStatusData, setPrimaryStatusData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [distributionTarget, setDistributionTarget] = useState(null);
  const [distributionPlan, setDistributionPlan] = useState(null);
  const [distributionLoading, setDistributionLoading] = useState(false);
  const [batchConfirmOpen, setBatchConfirmOpen] = useState(false);
  const [batchProcessing, setBatchProcessing] = useState(false);
  const [batchAction, setBatchAction] = useState("request");
  const [feedbackModal, setFeedbackModal] = useState(null);
  const [needsUser, setNeedsUser] = useState(null);
  const [needsDetail, setNeedsDetail] = useState(null);
  const [needsLoading, setNeedsLoading] = useState(false);
  const [needsSummaryModal, setNeedsSummaryModal] = useState(null);
  const [needsSummaryLoading, setNeedsSummaryLoading] = useState(false);
  const [rowStep, setRowStep] = useState(10);
  const [visibleRows, setVisibleRows] = useState(10);
  const [showAllRows, setShowAllRows] = useState(false);
  const canManageCenterRequests =
    user?.role === "super_admin" ||
    (user?.role === "barangay_official" &&
      Number(user.assigned_center_id) === Number(id));

  const fetchData = async () => {
    try {
      setLoading(true);

      const [response, requestsResponse] = await Promise.all([
        getRequest(`api/evac-list/${id}`),
        getRequest(`api/distribution-requests?centerId=${id}&status=all`)
      ]);
      const data = response.data || [];
      const currentCenter = response.center?.[0] || null;
      const totalCheckOuts = data.filter((user) => Boolean(user.checkout_at)).length;
      const totalCheckIns = data.length;

      setList(data);
      setDistributionRequests(requestsResponse?.requests || []);
      setCenter(currentCenter);
      setHeldSupplies(response.heldSupplies || []);
      setHeldSupplyLogs(response.heldSupplyLogs || []);

      setStats({
        totalFamilies: response.familyCount?.[0]?.familyCount || 0,
        totalPeople: data.reduce((sum, user) => sum + Number(user.number_of_people || 1), 0),
        totalIndividual: response.individualCount?.[0]?.individualCount || 0,
        totalCheckIns,
        totalCheckOuts,
        activeInside: totalCheckIns - totalCheckOuts,
        foodNeeds: response.needs?.foodCount || 0,
        medicineNeeds: response.needs?.medCount || 0,
        allergyCount: response.needs?.allergy || 0,
        specialFoodCount: response.needs?.specialCount || 0,
        maleCount: data.filter((user) => user.sex === "male").length,
        femaleCount: data.filter((user) => user.sex === "female").length
      });

      setSecondaryStatusData(response.secondaryStatus || []);
      setPrimaryStatusData(response.primaryStatus || []);
    } catch (error) {
      console.log(error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (authLoading) {
      return;
    }

    if (
      user?.role === "barangay_official" &&
      Number(user.assigned_center_id) !== Number(id)
    ) {
      navigate("/evacuation", { replace: true });
      return;
    }

    fetchData();
  }, [authLoading, id, navigate, user?.assigned_center_id, user?.role]);

  const filtered = list.filter((user) =>
    `${user.firstName} ${user.lastName}`.toLowerCase().includes(search.toLowerCase()) ||
    user.email?.toLowerCase().includes(search.toLowerCase()) ||
    user.barangay?.toLowerCase().includes(search.toLowerCase())
  );

  useEffect(() => {
    setVisibleRows(rowStep);
    setShowAllRows(false);
  }, [rowStep, search, id]);

  const normalizedRowStep =
    Number.isFinite(Number(rowStep)) && Number(rowStep) > 0 ? Number(rowStep) : 10;

  const latestRequestStateByRecipient = list.reduce((acc, user) => {
    const relatedRequests = distributionRequests
      .filter((request) =>
        (request.request_summary || []).some((item) => Number(item.recipient_id) === Number(user.id))
      )
      .sort((a, b) => new Date(b.created_at) - new Date(a.created_at));

    if (relatedRequests[0]) {
      const request = relatedRequests[0];
      const recipientSummary = (request.request_summary || []).find(
        (item) => Number(item.recipient_id) === Number(user.id)
      );

      acc[user.id] = {
        request,
        recipientSummary
      };
    }

    return acc;
  }, {});

  const isRequestCandidate = (user) => {
    if (!hasSupplyNeeds(user)) {
      return false;
    }

    const latestState = latestRequestStateByRecipient[user.id];
    if (!latestState) {
      return true;
    }

    const latestRequest = latestState.request;
    const recipientSummary = latestState.recipientSummary;

    if (latestRequest.status === "rejected") {
      return true;
    }

    return false;
  };

  const isDistributeCandidate = (user) => {
    const latestState = latestRequestStateByRecipient[user.id];
    const latestRequest = latestState?.request;
    const recipientSummary = latestState?.recipientSummary;
    return Boolean(
      hasSupplyNeeds(user) &&
      latestRequest &&
      latestRequest.status === "approved" &&
      recipientSummary?.approved_at &&
      !recipientSummary?.distributed_at
    );
  };

  const requestCandidates = filtered.filter(isRequestCandidate);

  const distributeCandidates = filtered.filter(isDistributeCandidate);
  const remainingNeedUsers = list.filter(isRequestCandidate);

  const approvedBatchRequest = [...distributionRequests]
    .filter((request) =>
      request.request_type === "batch" &&
      request.status === "approved" &&
      (request.request_summary || []).some((item) => item.approved_at && !item.distributed_at)
    )
    .sort((a, b) => new Date(b.created_at) - new Date(a.created_at))[0] || null;

  const requestRows = showAllRows ? requestCandidates : requestCandidates.slice(0, visibleRows);
  const distributeRows = showAllRows ? distributeCandidates : distributeCandidates.slice(0, visibleRows);
  const canShowMoreRequest = !showAllRows && requestRows.length < requestCandidates.length;
  const canShowMoreDistribute = !showAllRows && distributeRows.length < distributeCandidates.length;
  const canShowLessRequest = showAllRows || visibleRows > normalizedRowStep;
  const canShowLessDistribute = showAllRows || visibleRows > normalizedRowStep;

  const capacityPct = center
    ? Math.round((Number(center.current_occupancy || 0) / Math.max(Number(center.capacity || 1), 1)) * 100)
    : 0;

  const overviewCards = [
    { label: "Check In", value: stats.totalCheckIns, tone: "#dbeafe", icon: "bi bi-box-arrow-in-right" },
    { label: "Check Out", value: stats.totalCheckOuts, tone: "#fee2e2", icon: "bi bi-box-arrow-right" },
    { label: "Inside Center", value: stats.activeInside, tone: "#dcfce7", icon: "bi bi-house-door" },
    { label: "Families", value: stats.totalFamilies, tone: "#e0f2fe", icon: "bi bi-people" },
    { label: "Individuals", value: stats.totalIndividual, tone: "#f1f5f9", icon: "bi bi-person" },
    { label: "Total People", value: stats.totalPeople, tone: "#ede9fe", icon: "bi bi-person-lines-fill" }
  ];

  const displayedMedicineNeeds = remainingNeedUsers.filter((user) => user.medical).length;
  const displayedSpecialFoodNeeds = remainingNeedUsers.filter((user) => user.special_food).length;

  if (loading) {
    return (
      <div className="d-flex justify-content-center align-items-center" style={{ minHeight: 400 }}>
        <div className="spinner-border text-danger" />
      </div>
    );
  }

  const runBatchAction = async () => {
    try {
      setBatchProcessing(true);
      const response =
        batchAction === "distribute"
          ? await postRequest("/auth/inventory/distribute/batch", {
              centerId: Number(id),
              requestId: approvedBatchRequest?.id
            })
          : await postRequest("/auth/inventory/requests", {
              centerId: Number(id)
            });

      if (response.success) {
        setFeedbackModal({
          tone: "success",
          title: batchAction === "distribute" ? "Batch Distribution Complete" : "Batch Request Sent",
          message:
            response.message ||
            (batchAction === "distribute"
              ? "Batch distribution completed."
              : "Batch distribution request sent."),
          details:
            batchAction === "distribute"
              ? formatBatchDistributionReport(response)
              : formatRequestReport(response)
        });
        await fetchData();
      }
    } catch (error) {
      console.log(error);
      setFeedbackModal({
        tone: "danger",
        title: batchAction === "distribute" ? "Batch Distribution Failed" : "Batch Request Failed",
        message:
          error?.response?.data?.message ||
          (batchAction === "distribute"
            ? "Failed to distribute approved batch request"
            : "Failed to create batch request"),
        details: ""
      });
    } finally {
      setBatchProcessing(false);
      setBatchConfirmOpen(false);
    }
  };

  const openDistributionModal = async (user) => {
    setDistributionTarget(user);
    await fetchDistributionPlan(user.id);
  };

  const closeDistributionModal = () => {
    setDistributionTarget(null);
    setDistributionPlan(null);
    setDistributionLoading(false);
  };

  const fetchDistributionPlan = async (userId) => {
    try {
      setDistributionLoading(true);
      const response = await getRequest(
        `api/inventory/distribution-plan?centerId=${id}&userId=${userId}&scope=individual`
      );

      if (response.success) {
        setDistributionPlan(response.plan);
      }
    } catch (error) {
      console.log(error);
      setFeedbackModal({
        tone: "danger",
        title: "Plan Load Failed",
        message: "Failed to load distribution plan",
        details: ""
      });
    } finally {
      setDistributionLoading(false);
    }
  };

  const confirmDistribution = async () => {
    if (!distributionTarget) {
      return;
    }

    try {
      setDistributionLoading(true);
      const response = await postRequest("auth/inventory/requests", {
        centerId: Number(id),
        userId: distributionTarget.id,
        notes: `Requested from evacuation center ${center?.name || ""}`.trim()
      });

      if (response.success) {
        setFeedbackModal({
          tone: "success",
          title: "Distribution Request Sent",
          message: response.message || "Distribution request sent",
          details: formatRequestReport(response)
        });
        closeDistributionModal();
        await fetchData();
      }
    } catch (error) {
      console.log(error);
      setFeedbackModal({
        tone: "danger",
        title: "Request Failed",
        message: error?.response?.data?.message || "Failed to send distribution request",
        details: ""
      });
    } finally {
      setDistributionLoading(false);
    }
  };

  const runSingleDistribution = async (user) => {
    const latestState = latestRequestStateByRecipient[user.id];
    const request = latestState?.request;

    if (!request) {
      return;
    }

    try {
      setDistributionLoading(true);
      const payload = {
        centerId: Number(id),
        userId: user.id,
        requestId: request.id
      };

      const response = await postRequest("auth/inventory/distribute", payload);

      if (response.success) {
        setFeedbackModal({
          tone: "success",
          title: "Distribution Complete",
          message: response.message || "Relief goods distributed successfully.",
          details: formatSingleDistributionReport(response)
        });
        await fetchData();
      }
    } catch (error) {
      console.log(error);
      setFeedbackModal({
        tone: "danger",
        title: "Distribution Failed",
        message: error?.response?.data?.message || "Failed to distribute approved request",
        details: ""
      });
    } finally {
      setDistributionLoading(false);
    }
  };

  const openNeedsModal = async (user) => {
    try {
      setNeedsUser(user);
      setNeedsDetail(null);
      setNeedsLoading(true);

      const response = await getRequest(`api/profile/${user.id}`);
      if (response.success) {
        setNeedsDetail(response.evacuee);
      }
    } catch (error) {
      console.log(error);
      setFeedbackModal({
        tone: "danger",
        title: "Needs Load Failed",
        message: "Failed to load medicine and special food details.",
        details: ""
      });
      setNeedsUser(null);
    } finally {
      setNeedsLoading(false);
    }
  };

  const closeNeedsModal = () => {
    setNeedsUser(null);
    setNeedsDetail(null);
    setNeedsLoading(false);
  };

  const openNeedsSummaryModal = async (type) => {
    try {
      setNeedsSummaryModal({
        type,
        items: [],
        totalQuantity: 0,
        totalRecipients: 0
      });
      setNeedsSummaryLoading(true);

      const targetUsers = remainingNeedUsers.filter((user) =>
        type === "medicine" ? Boolean(user.medical) : Boolean(user.special_food)
      );

      const responses = await Promise.all(
        targetUsers.map((user) =>
          getRequest(`api/profile/${user.id}`)
            .then((response) => response?.evacuee || null)
            .catch(() => null)
        )
      );

      const aggregateMap = new Map();

      responses.forEach((evacuee) => {
        const sourceItems =
          type === "medicine" ? evacuee?.needs?.medicines || [] : evacuee?.needs?.special_foods || [];

        sourceItems.forEach((item) => {
          const key = String(item.name || "Unnamed Item").trim().toLowerCase();
          const quantity = Number(item.quantity || 0);

          if (!aggregateMap.has(key)) {
            aggregateMap.set(key, {
              name: item.name || "Unnamed Item",
              quantity: 0,
              recipients: 0
            });
          }

          const entry = aggregateMap.get(key);
          entry.quantity += quantity;
          entry.recipients += 1;
        });
      });

      const items = Array.from(aggregateMap.values()).sort((a, b) => {
        if (b.quantity !== a.quantity) {
          return b.quantity - a.quantity;
        }

        return a.name.localeCompare(b.name);
      });

      setNeedsSummaryModal({
        type,
        items,
        totalQuantity: items.reduce((sum, item) => sum + item.quantity, 0),
        totalRecipients: responses.filter((evacuee) => {
          const sourceItems =
            type === "medicine" ? evacuee?.needs?.medicines || [] : evacuee?.needs?.special_foods || [];
          return sourceItems.length > 0;
        }).length
      });
    } catch (error) {
      console.log(error);
      setFeedbackModal({
        tone: "danger",
        title: "Needs Summary Failed",
        message: "Failed to load the center needs summary.",
        details: ""
      });
      setNeedsSummaryModal(null);
    } finally {
      setNeedsSummaryLoading(false);
    }
  };

  const closeNeedsSummaryModal = () => {
    setNeedsSummaryModal(null);
    setNeedsSummaryLoading(false);
  };

  const downloadCsv = () => {
    const summaryRows = [
      ["Center", center?.name || ""],
      ["Barangay", center?.barangay || ""],
      ["City", center?.city || ""],
      ["Status", center?.status || ""],
      ["Capacity", center?.capacity || 0],
      ["Current Occupancy", center?.current_occupancy || 0],
      ["Check In", stats.totalCheckIns],
      ["Check Out", stats.totalCheckOuts],
      ["Inside Center", stats.activeInside],
      ["Families", stats.totalFamilies],
      ["Individuals", stats.totalIndividual],
      ["Total People", stats.totalPeople]
    ];

    const headers = [
      "Name",
      "Email",
      "Barangay",
      "Sex",
      "People",
      "Primary Status",
      "Inside Status",
      "Check In",
      "Check Out",
      "Medical",
      "Special Food",
      "Allergy"
    ];

    const detailRows = filtered.map((user) => [
      `${user.firstName} ${user.lastName}`,
      user.email || "",
      user.barangay || "",
      user.sex || "",
      Number(user.number_of_people || 1),
      user.primary_status || "",
      user.checkout_at ? "Checked Out" : "Inside",
      user.checkin_at ? new Date(user.checkin_at).toLocaleString("en-PH") : "",
      user.checkout_at ? new Date(user.checkout_at).toLocaleString("en-PH") : "",
      user.medical ? "Yes" : "No",
      user.special_food ? "Yes" : "No",
      user.allergy ? "Yes" : "No"
    ]);

    const rows = [
      ["Evacuation Analytics Export"],
      [],
      ...summaryRows,
      [],
      headers,
      ...detailRows
    ];

    const csv = rows
      .map((row) =>
        row
          .map((cell) => `"${String(cell ?? "").replace(/"/g, '""')}"`)
          .join(",")
      )
      .join("\n");

    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `${(center?.name || "evacuation-center").replace(/\s+/g, "-").toLowerCase()}-analytics.csv`;
    link.click();
    URL.revokeObjectURL(url);
  };

  const exportPdf = () => {
    const printWindow = window.open("", "_blank", "width=1200,height=900");
    if (!printWindow) return;

    const rowsHtml = filtered
      .map(
        (user, index) => `
          <tr>
            <td>${index + 1}</td>
            <td>${user.firstName} ${user.lastName}</td>
            <td>${user.email || ""}</td>
            <td>${user.barangay || ""}</td>
            <td>${Number(user.number_of_people || 1)}</td>
            <td>${user.primary_status || ""}</td>
            <td>${user.checkout_at ? "Checked Out" : "Inside"}</td>
          </tr>
        `
      )
      .join("");

    const cardsHtml = overviewCards
      .map(
        (card) => `
          <div class="card">
            <div class="label">${card.label}</div>
            <div class="value">${card.value}</div>
          </div>
        `
      )
      .join("");

    printWindow.document.write(`
      <html>
        <head>
          <title>Evacuation Analytics Export</title>
          <style>
            body { font-family: Arial, sans-serif; padding: 24px; color: #0f172a; }
            h1, h2, h3, p { margin: 0; }
            .header { margin-bottom: 24px; }
            .muted { color: #475569; font-size: 13px; }
            .grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 12px; margin: 20px 0; }
            .card { border: 1px solid #cbd5e1; border-radius: 12px; padding: 14px; }
            .label { font-size: 12px; color: #64748b; margin-bottom: 6px; }
            .value { font-size: 24px; font-weight: bold; }
            table { width: 100%; border-collapse: collapse; margin-top: 20px; }
            th, td { border: 1px solid #cbd5e1; padding: 8px; font-size: 12px; text-align: left; }
            th { background: #f8fafc; }
          </style>
        </head>
        <body>
          <div class="header">
            <h1>${center?.name || "Evacuation Center"} Analytics</h1>
            <p class="muted">${center?.barangay || ""}, ${center?.city || ""}</p>
            <p class="muted">Capacity: ${center?.current_occupancy || 0} / ${center?.capacity || 0}</p>
          </div>
          <div class="grid">${cardsHtml}</div>
          <h3>Evacuee List</h3>
          <table>
            <thead>
              <tr>
                <th>#</th>
                <th>Name</th>
                <th>Email</th>
                <th>Barangay</th>
                <th>People</th>
                <th>Primary Status</th>
                <th>Inside Status</th>
              </tr>
            </thead>
            <tbody>${rowsHtml}</tbody>
          </table>
        </body>
      </html>
    `);

    printWindow.document.close();
    printWindow.focus();
    setTimeout(() => {
      printWindow.print();
    }, 250);
  };

  return (
    <div className="p-3" style={{ background: "#f8fafc", minHeight: "100vh" }}>
      <div className="d-flex flex-wrap justify-content-between align-items-center gap-3 mb-4">
        <div>
          <Link to="/evacuation" className="btn btn-outline-secondary btn-sm rounded-pill px-3 mb-3">
            Back to Centers
          </Link>
          <h3 className="fw-bold mb-1">{center?.name || "Evacuation Center"} Analytics</h3>
          <p className="text-muted mb-0" style={{ fontSize: 13 }}>
            Track occupancy, evacuee conditions, and export the current center summary.
          </p>
        </div>

        <div className="d-flex flex-wrap gap-2">
          <button className="btn btn-outline-dark btn-sm rounded-pill px-3" onClick={downloadCsv}>
            Export Excel CSV
          </button>
          <button className="btn btn-outline-primary btn-sm rounded-pill px-3" onClick={exportPdf}>
            Export PDF
          </button>
        </div>
      </div>

      {center && (
        <div className="bg-white p-4 rounded-4 shadow-sm mb-4">
          <div className="row align-items-center g-3">
            <div className="col-lg-8">
              <div className="d-flex align-items-center gap-3">
                <div
                  className="d-flex align-items-center justify-content-center"
                  style={{
                    width: 56,
                    height: 56,
                    borderRadius: 18,
                    background: "#fee2e2",
                    color: "#b91c1c",
                    fontSize: "1.4rem"
                  }}
                >
                  <i className="bi bi-building"></i>
                </div>
                <div>
                  <h5 className="fw-bold mb-1">{center.name}</h5>
                  <p className="text-muted mb-1" style={{ fontSize: 13 }}>
                    {center.barangay}, {center.city}
                  </p>
                  <span
                    className={`badge ${
                      center.status === "open"
                        ? "bg-success"
                        : center.status === "full"
                        ? "bg-danger"
                        : "bg-secondary"
                    }`}
                  >
                    {center.status?.toUpperCase()}
                  </span>
                </div>
              </div>
            </div>

            <div className="col-lg-4">
              <div className="text-muted mb-1" style={{ fontSize: 12 }}>
                Capacity Usage
              </div>
              <div className="progress mb-2" style={{ height: 12 }}>
                <div
                  className={`progress-bar ${
                    capacityPct >= 90 ? "bg-danger" : capacityPct >= 70 ? "bg-warning" : "bg-success"
                  }`}
                  style={{ width: `${capacityPct}%` }}
                />
              </div>
              <div className="d-flex justify-content-between" style={{ fontSize: 12 }}>
                <span className="text-muted">
                  {center.current_occupancy} / {center.capacity} persons
                </span>
                <span className="fw-bold">{capacityPct}%</span>
              </div>
            </div>
          </div>
        </div>
      )}

      <div className="row g-3 mb-4">
        {overviewCards.map((card) => (
          <div className="col-sm-6 col-xl-2" key={card.label}>
            <OverviewCard {...card} />
          </div>
        ))}
      </div>

      <div className="row g-3 mb-4">
        <div className="col-lg-4">
          <NeedsPanel stats={stats} />
        </div>
        <div className="col-lg-4">
          <PrimaryStatusChart data={primaryStatusData} />
        </div>
        <div className="col-lg-4">
          <SecondaryStatusChart data={secondaryStatusData} />
        </div>
      </div>

      <div className="row g-3 mb-4">
        <div className="col-md-6 col-xl-3">
          <MiniStat title="Male" value={stats.maleCount} color="#2563eb" />
        </div>
        <div className="col-md-6 col-xl-3">
          <MiniStat title="Female" value={stats.femaleCount} color="#db2777" />
        </div>
        <div className="col-md-6 col-xl-3">
          <MiniStat
            title="Medicine Needs"
            value={displayedMedicineNeeds}
            color="#d97706"
            clickable
            onClick={() => openNeedsSummaryModal("medicine")}
          />
        </div>
        <div className="col-md-6 col-xl-3">
          <MiniStat
            title="Special Food Needs"
            value={displayedSpecialFoodNeeds}
            color="#16a34a"
            clickable
            onClick={() => openNeedsSummaryModal("special_food")}
          />
        </div>
      </div>

      <div className="row g-4 mb-4">
        <div className="col-xl-6">
          <BarangaySupplyTable rows={heldSupplies} />
        </div>
        <div className="col-xl-6">
          <BarangaySupplyLog rows={heldSupplyLogs} />
        </div>
      </div>

      <div className="bg-white p-4 rounded-4 shadow-sm mb-4">
        <div className="d-flex flex-wrap align-items-center justify-content-between gap-2 mb-3">
          <h6 className="fw-bold mb-0">
            Distribution Workflow
            <span className="badge bg-danger ms-2">{filtered.length}</span>
          </h6>
          <div className="d-flex flex-wrap align-items-center gap-2">
            <label className="text-muted mb-0" style={{ fontSize: 12 }}>
              Rows per load
            </label>
            <input
              type="number"
              min="1"
              className="form-control form-control-sm rounded-pill text-center"
              style={{ width: 90 }}
              value={rowStep}
              onChange={(e) => setRowStep(Math.max(1, Number(e.target.value) || 1))}
            />
            <div style={{ width: 280 }}>
              <input
                type="text"
                className="form-control form-control-sm border-0 shadow-sm rounded-pill px-3 py-2"
                placeholder="Search name, email, or barangay..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
          </div>
        </div>

        <div className="row g-3">
          <div className="col-xl-6">
            <CompactActionTable
              title="Needs To Request"
              count={requestCandidates.length}
              emptyText={search ? "No evacuees match the request filter." : "No evacuees need a new request right now."}
              rows={requestRows}
              onRowClick={(user) => navigate(`user/${user.id}`)}
              onActionClick={canManageCenterRequests ? openDistributionModal : null}
              onNeedsClick={openNeedsModal}
              actionLabel={canManageCenterRequests ? "Request" : "View Only"}
              headerAction={
                canManageCenterRequests ? (
                  <button
                    type="button"
                    className="btn btn-outline-primary btn-sm rounded-pill px-3"
                    onClick={() => {
                      setBatchAction("request");
                      setBatchConfirmOpen(true);
                    }}
                    disabled={requestCandidates.length === 0}
                  >
                    Batch Request
                  </button>
                ) : (
                  <span className="text-muted" style={{ fontSize: 12 }}>
                    View only
                  </span>
                )
              }
            />
            <TableControls
              showing={requestRows.length}
              total={requestCandidates.length}
              canShowLess={canShowLessRequest}
              canShowMore={canShowMoreRequest}
              showAllRows={showAllRows}
              onShowLess={() => {
                if (showAllRows) {
                  setShowAllRows(false);
                  setVisibleRows(Math.max(normalizedRowStep, requestCandidates.length - normalizedRowStep));
                  return;
                }

                setVisibleRows((prev) => Math.max(normalizedRowStep, prev - normalizedRowStep));
              }}
              onShowMore={() => setVisibleRows((prev) => prev + normalizedRowStep)}
              onShowAll={() => setShowAllRows(true)}
            />
          </div>

          <div className="col-xl-6">
            <CompactActionTable
              title="Approved To Distribute"
              count={distributeCandidates.length}
              actionLabel={
                canManageCenterRequests
                  ? distributionLoading
                    ? "Working..."
                    : "Distribute"
                  : "View Only"
              }
              emptyText={search ? "No evacuees match the distribute filter." : "No approved requests are waiting for distribution."}
              rows={distributeRows}
              onRowClick={(user) => navigate(`user/${user.id}`)}
              onActionClick={canManageCenterRequests ? runSingleDistribution : null}
              onNeedsClick={openNeedsModal}
              actionDisabled={!canManageCenterRequests || distributionLoading}
              headerAction={
                canManageCenterRequests ? (
                  <button
                    type="button"
                    className="btn btn-primary btn-sm rounded-pill px-3"
                    onClick={() => {
                      setBatchAction("distribute");
                      setBatchConfirmOpen(true);
                    }}
                    disabled={!approvedBatchRequest || batchProcessing}
                  >
                    Batch Distribute
                  </button>
                ) : (
                  <span className="text-muted" style={{ fontSize: 12 }}>
                    View only
                  </span>
                )
              }
            />
            <TableControls
              showing={distributeRows.length}
              total={distributeCandidates.length}
              canShowLess={canShowLessDistribute}
              canShowMore={canShowMoreDistribute}
              showAllRows={showAllRows}
              onShowLess={() => {
                if (showAllRows) {
                  setShowAllRows(false);
                  setVisibleRows(Math.max(normalizedRowStep, distributeCandidates.length - normalizedRowStep));
                  return;
                }

                setVisibleRows((prev) => Math.max(normalizedRowStep, prev - normalizedRowStep));
              }}
              onShowMore={() => setVisibleRows((prev) => prev + normalizedRowStep)}
              onShowAll={() => setShowAllRows(true)}
            />
          </div>
        </div>
      </div>

      {distributionTarget ? (
        <DistributionModal
          target={distributionTarget}
          plan={distributionPlan}
          loading={distributionLoading}
          onClose={closeDistributionModal}
          onConfirm={confirmDistribution}
        />
      ) : null}

      {needsUser ? (
        <NeedsDetailModal
          user={needsUser}
          detail={needsDetail}
          loading={needsLoading}
          onClose={closeNeedsModal}
        />
      ) : null}

      {needsSummaryModal ? (
        <NeedsSummaryModal
          type={needsSummaryModal.type}
          items={needsSummaryModal.items}
          totalQuantity={needsSummaryModal.totalQuantity}
          totalRecipients={needsSummaryModal.totalRecipients}
          loading={needsSummaryLoading}
          onClose={closeNeedsSummaryModal}
        />
      ) : null}

      {batchConfirmOpen ? (
        <ConfirmModal
          title={batchAction === "distribute" ? "Run Batch Distribution?" : "Send Batch Distribution Request?"}
          message={
            batchAction === "distribute"
              ? "This will distribute supplies for the latest approved batch request in this center."
              : "This will send a batch supply request to DSWD for all eligible evacuees in this center."
          }
          confirmLabel={
            batchProcessing
              ? batchAction === "distribute"
                ? "Distributing..."
                : "Sending..."
              : batchAction === "distribute"
              ? "Batch Distribute"
              : "Send Batch Request"
          }
          confirmDisabled={batchProcessing}
          onClose={() => {
            if (!batchProcessing) {
              setBatchConfirmOpen(false);
            }
          }}
          onConfirm={runBatchAction}
        />
      ) : null}

      {feedbackModal ? (
        <FeedbackModal
          tone={feedbackModal.tone}
          title={feedbackModal.title}
          message={feedbackModal.message}
          details={feedbackModal.details}
          onClose={() => setFeedbackModal(null)}
        />
      ) : null}
    </div>
  );
}

function OverviewCard({ label, value, icon, tone }) {
  return (
    <div className="bg-white p-3 rounded-4 shadow-sm h-100">
      <div className="d-flex align-items-center gap-3">
        <div
          className="d-flex align-items-center justify-content-center"
          style={{
            width: 44,
            height: 44,
            borderRadius: 14,
            background: tone,
            fontSize: "1.1rem"
          }}
        >
          <i className={icon}></i>
        </div>
        <div>
          <div className="text-muted" style={{ fontSize: 12 }}>
            {label}
          </div>
          <div className="fw-bold fs-4">{value}</div>
        </div>
      </div>
    </div>
  );
}

function CompactActionTable({
  title,
  count,
  actionLabel,
  rows,
  emptyText,
  onRowClick,
  onActionClick,
  onNeedsClick,
  headerAction,
  actionDisabled = false
}) {
  return (
    <div className="border rounded-4 p-3 h-100">
      <div className="d-flex flex-wrap align-items-center justify-content-between gap-2 mb-3">
        <h6 className="fw-bold mb-0">
          {title}
          <span className="badge bg-danger ms-2">{count}</span>
        </h6>
        {headerAction}
      </div>

      <div className="table-responsive">
        <table className="table table-hover align-middle mb-0" style={{ fontSize: 13 }}>
          <thead className="table-light">
            <tr>
              <th>#</th>
              <th>Name</th>
              <th>Needs</th>
              <th>Primary Status</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            {rows.length > 0 ? (
              rows.map((user, index) => (
                <tr
                  key={user.checkin_id || `${user.id}-${index}`}
                  style={{ cursor: "pointer" }}
                  onClick={() => onRowClick(user)}
                >
                  <td className="text-muted">{index + 1}</td>
                  <td>
                    <div className="fw-medium">
                      {user.firstName} {user.lastName}
                    </div>
                    <div className="text-muted" style={{ fontSize: 11 }}>
                      {user.sex}
                    </div>
                  </td>
                  <td>
                    <div className="d-flex flex-wrap gap-1 align-items-center">
                      {user.food ? <span className="badge bg-primary-subtle text-primary-emphasis">Food</span> : null}
                      {user.water ? <span className="badge bg-info-subtle text-info-emphasis">Water</span> : null}
                      {user.medical ? <span className="badge bg-warning-subtle text-warning-emphasis">Med</span> : null}
                      {user.special_food ? <span className="badge bg-success-subtle text-success-emphasis">Special Food</span> : null}
                      {user.allergy ? <span className="badge bg-danger-subtle text-danger-emphasis">Allergy</span> : null}
                      {!hasVisibleNeeds(user) ? (
                        <span className="text-muted" style={{ fontSize: 11 }}>None</span>
                      ) : null}
                      {(user.medical || user.special_food) ? (
                        <button
                          type="button"
                          className="btn btn-outline-secondary btn-sm rounded-pill px-2 py-1"
                          style={{ fontSize: 11 }}
                          onClick={(event) => {
                            event.stopPropagation();
                            onNeedsClick(user);
                          }}
                        >
                          View
                        </button>
                      ) : null}
                    </div>
                  </td>
                  <td>
                    <span className="badge bg-info-subtle text-info-emphasis">
                      {user.primary_status || "Unknown"}
                    </span>
                  </td>
                  <td onClick={(event) => event.stopPropagation()}>
                    {onActionClick ? (
                      <button
                        type="button"
                        className="btn btn-outline-primary btn-sm rounded-pill px-3"
                        onClick={() => onActionClick(user)}
                        disabled={actionDisabled}
                      >
                        {actionLabel}
                      </button>
                    ) : (
                      <span className="text-muted" style={{ fontSize: 12 }}>
                        {actionLabel}
                      </span>
                    )}
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="5" className="text-center text-muted py-4">
                  {emptyText}
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function TableControls({
  showing,
  total,
  canShowLess,
  canShowMore,
  showAllRows,
  onShowLess,
  onShowMore,
  onShowAll
}) {
  return (
    <div className="d-flex flex-wrap justify-content-between align-items-center gap-2 mt-3">
      <div className="text-muted" style={{ fontSize: 12 }}>
        Showing {showing} of {total} rows
      </div>

      <div className="d-flex flex-wrap gap-2">
        <button
          type="button"
          className="btn btn-outline-secondary btn-sm rounded-pill px-3"
          onClick={onShowLess}
          disabled={!canShowLess || total === 0}
        >
          Show Less
        </button>
        <button
          type="button"
          className="btn btn-outline-primary btn-sm rounded-pill px-3"
          onClick={onShowMore}
          disabled={!canShowMore}
        >
          Show More
        </button>
        <button
          type="button"
          className="btn btn-outline-secondary btn-sm rounded-pill px-3"
          onClick={onShowAll}
          disabled={showAllRows || total === 0}
        >
          Show All
        </button>
      </div>
    </div>
  );
}

function MiniStat({ title, value, color, clickable = false, onClick }) {
  return (
    <button
      type="button"
      className="bg-white p-3 rounded-4 shadow-sm h-100 border-0 text-start w-100"
      onClick={onClick}
      style={{ cursor: clickable ? "pointer" : "default" }}
      disabled={!clickable}
    >
      <div className="text-muted mb-1" style={{ fontSize: 12 }}>
        {title}
      </div>
      <div className="fw-bold fs-3" style={{ color }}>
        {value}
      </div>
      {clickable ? (
        <div className="text-muted mt-2" style={{ fontSize: 11 }}>
          Click to view list
        </div>
      ) : null}
    </button>
  );
}

function BarangaySupplyTable({ rows }) {
  return (
    <div className="bg-white rounded-4 shadow-sm p-4 h-100">
      <div className="d-flex justify-content-between align-items-center gap-2 mb-3">
        <div>
          <h6 className="fw-bold mb-1">Barangay Held Supplies</h6>
          <p className="text-muted mb-0" style={{ fontSize: 12 }}>
            Total supplies currently held for this evacuation center.
          </p>
        </div>
        <span className="badge bg-primary-subtle text-primary-emphasis">
          {rows.length} item{rows.length === 1 ? "" : "s"}
        </span>
      </div>

      {rows.length > 0 ? (
        <div className="table-responsive">
          <table className="table align-middle mb-0" style={{ fontSize: 13 }}>
            <thead className="table-light">
              <tr>
                <th>Item</th>
                <th>Category</th>
                <th>Quantity</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((item) => (
                <tr key={item.id}>
                  <td className="fw-medium">{item.name}</td>
                  <td>{formatHeldSupplyCategory(item.category)}</td>
                  <td>{item.quantity}</td>
                  <td>
                    <span className={`badge ${Number(item.is_active) ? "bg-success-subtle text-success-emphasis" : "bg-secondary-subtle text-secondary-emphasis"}`}>
                      {Number(item.is_active) ? "Active" : "Inactive"}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <div className="border rounded-4 p-4 text-center text-muted" style={{ fontSize: 13 }}>
          No barangay-held supplies recorded for this center yet.
        </div>
      )}
    </div>
  );
}

function BarangaySupplyLog({ rows }) {
  return (
    <div className="bg-white rounded-4 shadow-sm p-4 h-100">
      <div className="d-flex justify-content-between align-items-center gap-2 mb-3">
        <div>
          <h6 className="fw-bold mb-1">Barangay Supply Log</h6>
          <p className="text-muted mb-0" style={{ fontSize: 12 }}>
            Movement history for supplies held by this evacuation center.
          </p>
        </div>
        <span className="badge bg-secondary-subtle text-secondary-emphasis">
          {rows.length} log{rows.length === 1 ? "" : "s"}
        </span>
      </div>

      {rows.length > 0 ? (
        <div
          className="border rounded-4 overflow-auto"
          style={{ maxHeight: 360 }}
        >
          <table className="table align-middle mb-0" style={{ fontSize: 13 }}>
            <thead className="table-light" style={{ position: "sticky", top: 0, zIndex: 1 }}>
              <tr>
                <th>Date</th>
                <th>Item</th>
                <th>Type</th>
                <th>Qty</th>
                <th>By</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((log) => (
                <tr key={log.id}>
                  <td>{formatDateTime(log.created_at)}</td>
                  <td>
                    <div className="fw-medium">{log.inventory_name}</div>
                    <div className="text-muted" style={{ fontSize: 11 }}>
                      {formatHeldSupplyCategory(log.category)}
                    </div>
                  </td>
                  <td>
                    <span className={`badge ${log.type === "in" ? "bg-success-subtle text-success-emphasis" : "bg-danger-subtle text-danger-emphasis"}`}>
                      {(log.type || "").toUpperCase()}
                    </span>
                  </td>
                  <td>{log.quantity}</td>
                  <td>
                    <div className="fw-medium">
                      {[log.admin_first_name, log.admin_last_name].filter(Boolean).join(" ") || "Unknown admin"}
                    </div>
                    {log.user_first_name || log.user_last_name ? (
                      <div className="text-muted" style={{ fontSize: 11 }}>
                        Recipient: {[log.user_first_name, log.user_last_name].filter(Boolean).join(" ")}
                      </div>
                    ) : null}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <div className="border rounded-4 p-4 text-center text-muted" style={{ fontSize: 13 }}>
          No barangay supply logs found for this center.
        </div>
      )}
    </div>
  );
}

function NeedsSummaryModal({ type, items, totalQuantity, totalRecipients, loading, onClose }) {
  const title = type === "medicine" ? "Medicine Needs" : "Special Food Needs";
  const accent = type === "medicine" ? "#d97706" : "#16a34a";

  return (
    <BaseModal onClose={onClose} width={720}>
      <div style={{ maxHeight: "82vh", overflowY: "auto" }}>
        <div className="d-flex justify-content-between align-items-start gap-3 mb-4">
          <div>
            <h5 className="fw-bold mb-1">{title}</h5>
            <p className="text-muted mb-0" style={{ fontSize: 13 }}>
              Combined requested items for this evacuation center.
            </p>
          </div>
          <button type="button" className="btn btn-outline-secondary btn-sm rounded-pill px-3" onClick={onClose}>
            Close
          </button>
        </div>

        <div className="row g-3 mb-4">
          <div className="col-md-6">
            <div className="border rounded-4 p-3 bg-light-subtle">
              <div className="text-muted mb-1" style={{ fontSize: 12 }}>
                Total Quantity
              </div>
              <div className="fw-bold fs-3" style={{ color: accent }}>
                {totalQuantity}
              </div>
            </div>
          </div>
          <div className="col-md-6">
            <div className="border rounded-4 p-3 bg-light-subtle">
              <div className="text-muted mb-1" style={{ fontSize: 12 }}>
                Total Recipients
              </div>
              <div className="fw-bold fs-3">{totalRecipients}</div>
            </div>
          </div>
        </div>

        {loading ? (
          <div className="text-center py-4">
            <div className="spinner-border text-primary" />
          </div>
        ) : items.length ? (
          <div className="border rounded-4 overflow-hidden">
            <div className="table-responsive">
              <table className="table align-middle mb-0">
                <thead className="table-light">
                  <tr>
                    <th>Item</th>
                    <th>Total Count</th>
                    <th>Recipients</th>
                  </tr>
                </thead>
                <tbody>
                  {items.map((item) => (
                    <tr key={item.name}>
                      <td className="fw-medium">{item.name}</td>
                      <td>{item.quantity}</td>
                      <td>{item.recipients}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        ) : (
          <div className="border rounded-4 p-4 text-center text-muted">
            No {type === "medicine" ? "medicine" : "special food"} requests found.
          </div>
        )}
      </div>
    </BaseModal>
  );
}

function DistributionModal({
  target,
  plan,
  loading,
  onClose,
  onConfirm
}) {
  return (
    <BaseModal onClose={onClose} width={760}>
      <div style={{ maxHeight: "82vh", overflowY: "auto" }}>
        <div className="d-flex justify-content-between align-items-start gap-3 mb-3">
          <div>
            <h5 className="fw-bold mb-1">Individual Distribution Request</h5>
            <p className="text-muted mb-0" style={{ fontSize: 13 }}>
              Review the package plan for this evacuee, then send it to DSWD for approval.
            </p>
          </div>
          <button type="button" className="btn btn-outline-secondary btn-sm rounded-pill px-3" onClick={onClose}>
            Close
          </button>
        </div>

        <div className="mb-3">
          <div className="text-muted mb-1" style={{ fontSize: 12 }}>
            Recipient
          </div>
          <div className="fw-semibold">
            {target.firstName} {target.lastName}
          </div>
          {target.family_id ? (
            <div className="text-muted" style={{ fontSize: 12 }}>
              Family ID: {target.family_id}
            </div>
          ) : null}
        </div>

        {loading ? (
          <div className="text-center py-4">
            <div className="spinner-border text-primary" />
          </div>
        ) : plan ? (
          <>
            <div className="row g-3 mb-4">
              <div className="col-md-4">
                <PlanCard title="Recipient" value={plan.recipientLabel} />
              </div>
              <div className="col-md-4">
                <PlanCard title="Headcount" value={plan.headcount} />
              </div>
              <div className="col-md-4">
                <PlanCard title="Package Scope" value={plan.scope} />
              </div>
            </div>

            <div className="mb-4">
              <h6 className="fw-bold mb-2">Base Package</h6>
              <div className="row g-2">
                <div className="col-md-6">
                  <div className="border rounded-4 p-3 bg-light-subtle">
                    <div className="text-muted" style={{ fontSize: 12 }}>Food</div>
                    <div className="fw-bold fs-5">{plan.basePackage.food}</div>
                  </div>
                </div>
                <div className="col-md-6">
                  <div className="border rounded-4 p-3 bg-light-subtle">
                    <div className="text-muted" style={{ fontSize: 12 }}>Water</div>
                    <div className="fw-bold fs-5">{plan.basePackage.water}</div>
                  </div>
                </div>
              </div>
            </div>

            <div className="mb-4">
              <h6 className="fw-bold mb-2">Inventory Allocation</h6>
              <div className="table-responsive">
                <table className="table table-sm align-middle">
                  <thead>
                    <tr>
                      <th>Category</th>
                      <th>Required</th>
                      <th>Available</th>
                      <th>Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {plan.categoryPlan.map((entry) => (
                      <tr key={entry.category}>
                        <td>{entry.label}</td>
                        <td>{entry.requiredQuantity}</td>
                        <td>{entry.availableQuantity}</td>
                        <td>
                          <span className={`badge ${entry.enough ? "bg-success" : "bg-danger"}`}>
                            {entry.enough ? "Ready" : "Insufficient"}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            <div className="mb-4">
              <h6 className="fw-bold mb-2">Special Requests</h6>
              {plan.specialNeedSummary.length > 0 ? (
                <div className="d-flex flex-column gap-2">
                  {plan.specialNeedSummary.map((need) => (
                    <div key={need.id} className="border rounded-4 p-3 bg-light-subtle">
                      <div className="fw-semibold">{need.name || need.type}</div>
                      <div className="text-muted" style={{ fontSize: 12 }}>
                        {need.type} • Qty {need.quantity}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-muted" style={{ fontSize: 13 }}>
                  No pending medicine or special food requests for this selection.
                </div>
              )}
            </div>

            <div className="mb-4">
              <h6 className="fw-bold mb-2">Allergy Notes</h6>
              {plan.allergyNotes.length > 0 ? (
                <div className="d-flex flex-column gap-2">
                  {plan.allergyNotes.map((note) => (
                    <div key={note.id} className="border rounded-4 p-3 bg-light-subtle">
                      <div className="fw-semibold">{note.label}</div>
                      <div className="text-muted" style={{ fontSize: 12 }}>
                        {note.notes || "No extra notes"}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-muted" style={{ fontSize: 13 }}>
                  No allergy notes recorded.
                </div>
              )}
            </div>

            {plan.shortages.length > 0 ? (
              <div className="alert alert-danger">
                Some inventory categories are not enough for this package. Refill stock first or edit inventory quantities.
              </div>
            ) : null}

            <div className="d-flex justify-content-end gap-2">
              <button type="button" className="btn btn-outline-secondary rounded-pill px-3" onClick={onClose}>
                Cancel
              </button>
              <button
                type="button"
                className="btn btn-primary rounded-pill px-3"
                disabled={plan.shortages.length > 0}
                onClick={onConfirm}
              >
                Send Request
              </button>
            </div>
          </>
        ) : (
          <div className="text-muted">No plan available.</div>
        )}
      </div>
    </BaseModal>
  );
}

function formatRequestReport(response) {
  const totals = Array.isArray(response?.report?.totals)
    ? response.report.totals
    : Object.entries(response?.report?.totals || {}).map(([type, quantity]) => ({
        type,
        quantity
      }));

  const recipientLines = Array.isArray(response?.report?.recipients)
    ? response.report.recipients.map((recipient) => recipient.label).filter(Boolean)
    : [];

  const totalLine = totals.length
    ? totals
        .map((item) => {
          const label = item.label || formatCategoryLabel(item.type);
          return `${label}: ${item.quantity}`;
        })
        .join(", ")
    : "";

  const detailLines = [];

  if (response?.requestId) {
    detailLines.push(`Request ID: ${response.requestId}`);
  }

  if (totalLine) {
    detailLines.push(`Generated report totals: ${totalLine}`);
  }

  if (recipientLines.length > 0) {
    detailLines.push(`Recipients: ${recipientLines.join(", ")}`);
  }

  return detailLines.join("\n");
}

function formatSingleDistributionReport(response) {
  const categoryLines = Array.isArray(response?.plan?.categoryPlan)
    ? response.plan.categoryPlan.map((entry) => `${entry.label}: ${entry.requiredQuantity}`)
    : [];

  const detailLines = [];

  if (response?.plan?.recipientLabel) {
    detailLines.push(`Recipient: ${response.plan.recipientLabel}`);
  }

  if (categoryLines.length > 0) {
    detailLines.push(`Distributed: ${categoryLines.join(", ")}`);
  }

  return detailLines.join("\n");
}

function formatBatchDistributionReport(response) {
  const totalLines = Array.isArray(response?.totals)
    ? response.totals.map((item) => `${item.label || formatCategoryLabel(item.category)}: ${item.quantity}`)
    : [];

  const detailLines = [];

  if (Number.isFinite(Number(response?.distributedCount))) {
    detailLines.push(`Recipients served: ${response.distributedCount}`);
  }

  if (totalLines.length > 0) {
    detailLines.push(`Distributed totals: ${totalLines.join(", ")}`);
  }

  return detailLines.join("\n");
}

function formatCategoryLabel(type) {
  if (type === "special") {
    return "Special Food";
  }

  if (!type) {
    return "Unknown";
  }

  return type.charAt(0).toUpperCase() + type.slice(1);
}

function formatHeldSupplyCategory(type) {
  if (type === "special") {
    return "Special Food";
  }

  if (type === "wtaer") {
    return "Water";
  }

  return formatCategoryLabel(type);
}

function PlanCard({ title, value }) {
  return (
    <div className="border rounded-4 p-3 h-100 bg-light-subtle">
      <div className="text-muted" style={{ fontSize: 12 }}>
        {title}
      </div>
      <div className="fw-bold fs-5">{value}</div>
    </div>
  );
}

function NeedsDetailModal({ user, detail, loading, onClose }) {
  const medicines = detail?.needs?.medicines || [];
  const specialFoods = detail?.needs?.special_foods || [];

  return (
    <BaseModal onClose={onClose} width={620}>
      <div className="d-flex justify-content-between align-items-start gap-3 mb-3">
        <div>
          <h5 className="fw-bold mb-1">Special Needs Listing</h5>
          <p className="text-muted mb-0" style={{ fontSize: 13 }}>
            {user.firstName} {user.lastName}
          </p>
        </div>
        <button type="button" className="btn btn-outline-secondary btn-sm rounded-pill px-3" onClick={onClose}>
          Close
        </button>
      </div>

      {loading ? (
        <div className="text-center py-4">
          <div className="spinner-border text-primary" />
        </div>
      ) : (
        <div className="row g-3">
          <div className="col-md-6">
            <div className="border rounded-4 p-3 h-100 bg-light-subtle">
              <h6 className="fw-bold mb-3">Medicine</h6>
              {medicines.length > 0 ? (
                <div className="d-flex flex-column gap-2">
                  {medicines.map((item) => (
                    <div key={item.id || item.name} className="border rounded-4 p-3 bg-white">
                      <div className="fw-semibold">{item.name}</div>
                      <div className="text-muted" style={{ fontSize: 12 }}>
                        Qty {item.quantity}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-muted" style={{ fontSize: 13 }}>
                  No medicine listed.
                </div>
              )}
            </div>
          </div>

          <div className="col-md-6">
            <div className="border rounded-4 p-3 h-100 bg-light-subtle">
              <h6 className="fw-bold mb-3">Special Food</h6>
              {specialFoods.length > 0 ? (
                <div className="d-flex flex-column gap-2">
                  {specialFoods.map((item) => (
                    <div key={item.id || item.name} className="border rounded-4 p-3 bg-white">
                      <div className="fw-semibold">{item.name}</div>
                      <div className="text-muted" style={{ fontSize: 12 }}>
                        Qty {item.quantity}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-muted" style={{ fontSize: 13 }}>
                  No special food listed.
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </BaseModal>
  );
}

function ConfirmModal({
  title,
  message,
  confirmLabel,
  confirmDisabled,
  onClose,
  onConfirm
}) {
  return (
    <BaseModal onClose={onClose} width={520}>
      <h5 className="fw-bold mb-2">{title}</h5>
      <p className="text-muted mb-4" style={{ fontSize: 14 }}>
        {message}
      </p>
      <div className="d-flex justify-content-end gap-2">
        <button type="button" className="btn btn-outline-secondary rounded-pill px-3" onClick={onClose}>
          Cancel
        </button>
        <button
          type="button"
          className="btn btn-primary rounded-pill px-3"
          disabled={confirmDisabled}
          onClick={onConfirm}
        >
          {confirmLabel}
        </button>
      </div>
    </BaseModal>
  );
}

function FeedbackModal({ tone, title, message, details, onClose }) {
  const toneMap = {
    success: {
      badge: "#dcfce7",
      color: "#166534",
      icon: "bi bi-check-circle"
    },
    danger: {
      badge: "#fee2e2",
      color: "#b91c1c",
      icon: "bi bi-exclamation-triangle"
    }
  };

  const currentTone = toneMap[tone] || toneMap.success;

  return (
    <BaseModal onClose={onClose} width={560}>
      <div className="d-flex align-items-start gap-3 mb-3">
        <div
          className="d-flex align-items-center justify-content-center"
          style={{
            width: 48,
            height: 48,
            borderRadius: 16,
            background: currentTone.badge,
            color: currentTone.color,
            fontSize: "1.2rem"
          }}
        >
          <i className={currentTone.icon}></i>
        </div>
        <div>
          <h5 className="fw-bold mb-1">{title}</h5>
          <p className="text-muted mb-0" style={{ fontSize: 14 }}>
            {message}
          </p>
        </div>
      </div>
      {details ? (
        <div
          className="rounded-4 border p-3 mb-4"
          style={{ background: "#f8fafc", whiteSpace: "pre-line", fontSize: 13 }}
        >
          {details}
        </div>
      ) : null}
      <div className="d-flex justify-content-end">
        <button type="button" className="btn btn-primary rounded-pill px-3" onClick={onClose}>
          Close
        </button>
      </div>
    </BaseModal>
  );
}

function BaseModal({ children, onClose, width = 640 }) {
  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        background: "rgba(15, 23, 42, 0.52)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        zIndex: 1100,
        padding: 16
      }}
      onClick={onClose}
    >
      <div
        className="bg-white rounded-4 shadow-lg p-4"
        style={{
          width: `min(${width}px, 100%)`,
          border: "1px solid #e2e8f0"
        }}
        onClick={(event) => event.stopPropagation()}
      >
        {children}
      </div>
    </div>
  );
}

export default Listing;

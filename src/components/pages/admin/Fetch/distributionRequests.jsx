import { useEffect, useMemo, useState } from "react";
import { getRequest, putRequest } from "../../../../API/API";

const STATUS_STYLES = {
  approved: "bg-success",
  rejected: "bg-danger",
  pending: "bg-warning text-dark"
};

const formatDateTime = (value) => {
  if (!value) {
    return "Not available";
  }

  return new Date(value).toLocaleString("en-PH");
};

const formatRequestType = (value) => {
  if (value === "batch") {
    return "Batch";
  }

  return "Individual";
};

const formatCategoryLabel = (value) => {
  if (value === "special") {
    return "Special Food";
  }

  if (!value) {
    return "Unknown";
  }

  return value.charAt(0).toUpperCase() + value.slice(1);
};

export default function DistributionRequests() {
  const [requests, setRequests] = useState([]);
  const [statusFilter, setStatusFilter] = useState("pending");
  const [loading, setLoading] = useState(true);
  const [selectedRequest, setSelectedRequest] = useState(null);
  const [actionStatus, setActionStatus] = useState("approved");
  const [reviewNotes, setReviewNotes] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const fetchRequests = async () => {
    try {
      setLoading(true);
      const response = await getRequest(`/api/distribution-requests?status=${statusFilter}`);
      if (response.success) {
        setRequests(response.requests || []);
      }
    } catch (error) {
      console.log(error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRequests();
  }, [statusFilter]);

  const openRequestModal = (request, nextStatus = null) => {
    setSelectedRequest(request);
    setActionStatus(nextStatus || request.status || "pending");
    setReviewNotes(request.review_notes || "");
  };

  const isLockedRequest = Boolean(
    selectedRequest && ["approved", "rejected"].includes(selectedRequest.status)
  );

  const handleUpdateStatus = async () => {
    if (!selectedRequest) {
      return;
    }

    try {
      setSubmitting(true);
      const response = await putRequest(
        `auth/inventory/requests/${selectedRequest.id}/status`,
        {
          status: actionStatus,
          reviewNotes
        }
      );

      if (response.success) {
        setSelectedRequest(null);
        setReviewNotes("");
        await fetchRequests();
      }
    } catch (error) {
      console.log(error);
      alert(error?.response?.data?.message || "Failed to update request");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="p-4" style={{ background: "#f8fafc", minHeight: "100vh" }}>
      <div className="d-flex flex-wrap justify-content-between align-items-center gap-3 mb-4">
        <div>
          <h3 className="fw-bold mb-1">Distribution Requests</h3>
          <p className="text-muted mb-0" style={{ fontSize: 13 }}>
            Review supply requests from evacuation centers and open each row to inspect the generated request report.
          </p>
        </div>

        <div className="d-flex flex-wrap gap-2">
          <FilterButton label="All" active={statusFilter === "all"} onClick={() => setStatusFilter("all")} />
          <FilterButton label="Pending" active={statusFilter === "pending"} onClick={() => setStatusFilter("pending")} />
          <FilterButton label="Approved" active={statusFilter === "approved"} onClick={() => setStatusFilter("approved")} />
          <FilterButton label="Rejected" active={statusFilter === "rejected"} onClick={() => setStatusFilter("rejected")} />
        </div>
      </div>

      <div className="bg-white rounded-4 shadow-sm p-4">
        {loading ? (
          <div className="d-flex justify-content-center align-items-center" style={{ minHeight: 240 }}>
            <div className="spinner-border text-danger" />
          </div>
        ) : requests.length > 0 ? (
          <div className="table-responsive">
            <table className="table align-middle mb-0">
              <thead>
                <tr className="text-muted">
                  <th>Request</th>
                  <th>Center</th>
                  <th>Recipient</th>
                  <th>Requested By</th>
                  <th>Status</th>
                  <th>Created</th>
                  <th className="text-end">Actions</th>
                </tr>
              </thead>
              <tbody>
                {requests.map((request) => (
                  <tr
                    key={request.id}
                    role="button"
                    tabIndex={0}
                    className="align-middle"
                    style={{ cursor: "pointer" }}
                    onClick={() => openRequestModal(request)}
                    onKeyDown={(event) => {
                      if (event.key === "Enter" || event.key === " ") {
                        event.preventDefault();
                        openRequestModal(request);
                      }
                    }}
                  >
                    <td>
                      <div className="fw-semibold">Request #{request.id}</div>
                      <div className="text-muted" style={{ fontSize: 12 }}>
                        {formatRequestType(request.request_type)} request • {request.recipient_count || 0} recipient
                        {(request.recipient_count || 0) === 1 ? "" : "s"}
                      </div>
                    </td>
                    <td>
                      <div className="fw-medium">{request.center_name}</div>
                      <div className="text-muted" style={{ fontSize: 12 }}>
                        {request.center_city || "Center location unavailable"}
                      </div>
                    </td>
                    <td>
                      <div className="fw-medium">
                        {request.primary_recipient ||
                          (request.request_type === "batch"
                            ? `${request.recipient_count || 0} recipients`
                            : "Recipient unavailable")}
                      </div>
                      <div className="text-muted" style={{ fontSize: 12 }}>
                        {(request.summary_totals || [])
                          .map((item) => `${item.label}: ${item.quantity}`)
                          .join(", ") || "No generated summary"}
                      </div>
                    </td>
                    <td>
                      {request.requester_first_name} {request.requester_last_name}
                    </td>
                    <td>
                      <span className={`badge ${STATUS_STYLES[request.status] || "bg-secondary"}`}>
                        {(request.status || "pending").toUpperCase()}
                      </span>
                    </td>
                    <td>{formatDateTime(request.created_at)}</td>
                    <td className="text-end">
                      <div className="d-flex flex-wrap gap-2 justify-content-end">
                        {request.status === "pending" ? (
                          <>
                            <button
                              type="button"
                              className="btn btn-sm btn-outline-primary"
                              onClick={(event) => {
                                event.stopPropagation();
                                openRequestModal(request, "approved");
                              }}
                            >
                              Approve
                            </button>
                            <button
                              type="button"
                              className="btn btn-sm btn-outline-secondary"
                              onClick={(event) => {
                                event.stopPropagation();
                                openRequestModal(request, "pending");
                              }}
                            >
                              Pending
                            </button>
                            <button
                              type="button"
                              className="btn btn-sm btn-outline-danger"
                              onClick={(event) => {
                                event.stopPropagation();
                                openRequestModal(request, "rejected");
                              }}
                            >
                              Reject
                            </button>
                          </>
                        ) : (
                          <button
                            type="button"
                            className="btn btn-sm btn-outline-secondary"
                            onClick={(event) => {
                              event.stopPropagation();
                              openRequestModal(request);
                            }}
                          >
                            View
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="text-center text-muted py-5">
            No distribution requests found for the selected filter.
          </div>
        )}
      </div>

      {selectedRequest ? (
        <RequestReviewModal
          request={selectedRequest}
          locked={isLockedRequest}
          actionStatus={actionStatus}
          onActionStatusChange={setActionStatus}
          reviewNotes={reviewNotes}
          onNotesChange={setReviewNotes}
          submitting={submitting}
          onClose={() => {
            if (!submitting) {
              setSelectedRequest(null);
            }
          }}
          onSubmit={handleUpdateStatus}
        />
      ) : null}
    </div>
  );
}

function FilterButton({ label, active, onClick }) {
  return (
    <button
      type="button"
      className={`btn btn-sm rounded-pill px-3 ${active ? "btn-dark" : "btn-outline-secondary"}`}
      onClick={onClick}
    >
      {label}
    </button>
  );
}

function RequestReviewModal({
  request,
  locked,
  actionStatus,
  onActionStatusChange,
  reviewNotes,
  onNotesChange,
  submitting,
  onClose,
  onSubmit
}) {
  const groupedSummary = useMemo(() => {
    const groups = {};

    (request.request_summary || []).forEach((item) => {
      const recipientName = item.recipient_name || "Recipient";
      if (!groups[recipientName]) {
        groups[recipientName] = [];
      }

      groups[recipientName].push(item);
    });

    return Object.entries(groups);
  }, [request]);

  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        background: "rgba(15, 23, 42, 0.5)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: 16,
        zIndex: 1100
      }}
      onClick={onClose}
    >
      <div
        className="bg-white rounded-4 shadow-lg p-4"
        style={{
          width: "min(920px, 100%)",
          maxHeight: "90vh",
          overflowY: "auto",
          border: "1px solid #e2e8f0"
        }}
        onClick={(event) => event.stopPropagation()}
      >
        <div className="d-flex justify-content-between align-items-start gap-3 mb-3">
          <div>
            <h5 className="fw-bold mb-1">Distribution Request Details</h5>
            <p className="text-muted mb-0" style={{ fontSize: 13 }}>
              Request #{request.id} • {request.center_name}
            </p>
          </div>
          <button type="button" className="btn btn-outline-secondary btn-sm rounded-pill px-3" onClick={onClose}>
            Close
          </button>
        </div>

        <div className="row g-3 mb-3">
          <DetailCard label="Request Type" value={formatRequestType(request.request_type)} />
          <DetailCard label="Status" value={(request.status || "pending").toUpperCase()} />
          <DetailCard label="Recipients" value={`${request.recipient_count || 0}`} />
          <DetailCard label="Created" value={formatDateTime(request.created_at)} />
        </div>

        <div className="border rounded-4 p-3 bg-light-subtle mb-3">
          <div className="row g-3">
            <div className="col-md-6">
              <div className="text-muted mb-1" style={{ fontSize: 12 }}>Requested By</div>
              <div className="fw-semibold">
                {request.requester_first_name} {request.requester_last_name}
              </div>
            </div>
            <div className="col-md-6">
              <div className="text-muted mb-1" style={{ fontSize: 12 }}>Reviewed By</div>
              <div className="fw-semibold">
                {request.reviewer_first_name
                  ? `${request.reviewer_first_name} ${request.reviewer_last_name}`
                  : "Not reviewed yet"}
              </div>
            </div>
            <div className="col-md-6">
              <div className="text-muted mb-1" style={{ fontSize: 12 }}>Approved At</div>
              <div className="fw-semibold">{formatDateTime(request.approved_at)}</div>
            </div>
            <div className="col-md-6">
              <div className="text-muted mb-1" style={{ fontSize: 12 }}>Executed At</div>
              <div className="fw-semibold">{formatDateTime(request.executed_at)}</div>
            </div>
          </div>
          {request.notes ? (
            <div className="mt-3">
              <div className="text-muted mb-1" style={{ fontSize: 12 }}>Request Notes</div>
              <div className="fw-medium">{request.notes}</div>
            </div>
          ) : null}
        </div>

        <div className="border rounded-4 p-3 mb-3">
          <div className="d-flex justify-content-between align-items-center gap-3 mb-3">
            <div>
              <h6 className="fw-bold mb-1">Generated Request Report</h6>
              <p className="text-muted mb-0" style={{ fontSize: 13 }}>
                Summary generated at request time from the current distribution plan.
              </p>
            </div>
          </div>

          <div className="row g-3 mb-3">
            {(request.summary_totals || []).map((item) => (
              <div className="col-sm-6 col-lg-3" key={item.type}>
                <div className="border rounded-4 p-3 h-100 bg-light-subtle">
                  <div className="text-muted mb-1" style={{ fontSize: 12 }}>
                    {item.label}
                  </div>
                  <div className="fw-bold fs-5">{item.quantity}</div>
                </div>
              </div>
            ))}
          </div>

          <div className="table-responsive">
            <table className="table align-middle mb-0">
              <thead>
                <tr className="text-muted">
                  <th>Recipient</th>
                  <th>Category</th>
                  <th>Quantity</th>
                </tr>
              </thead>
              <tbody>
                {(request.request_summary || []).length > 0 ? (
                  (request.request_summary || []).map((item) => (
                    <tr key={item.id}>
                      <td>{item.recipient_name || "Recipient"}</td>
                      <td>{formatCategoryLabel(item.type)}</td>
                      <td>{item.quantity}</td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={3} className="text-center text-muted py-4">
                      No request summary was generated for this request.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          {groupedSummary.length > 0 ? (
            <div className="mt-3">
              <div className="text-muted mb-2" style={{ fontSize: 12 }}>Recipient Breakdown</div>
              <div className="d-flex flex-column gap-2">
                {groupedSummary.map(([recipientName, items]) => (
                  <div key={recipientName} className="border rounded-4 px-3 py-2 bg-white">
                    <div className="fw-semibold">{recipientName}</div>
                    <div className="text-muted" style={{ fontSize: 12 }}>
                      {items.map((item) => `${formatCategoryLabel(item.type)}: ${item.quantity}`).join(", ")}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ) : null}
        </div>

        {locked ? (
          <div className="alert alert-light border mb-3">
            This request already has a final status and can no longer be changed.
          </div>
        ) : null}

        <div className="mb-3">
          <label className="form-label fw-semibold">Request Action</label>
          <div className="d-flex flex-wrap gap-2">
            <button
              type="button"
              className={`btn rounded-pill px-3 ${actionStatus === "approved" ? "btn-primary" : "btn-outline-primary"}`}
              onClick={() => onActionStatusChange("approved")}
              disabled={locked}
            >
              Approve
            </button>
            <button
              type="button"
              className={`btn rounded-pill px-3 ${actionStatus === "pending" ? "btn-secondary" : "btn-outline-secondary"}`}
              onClick={() => onActionStatusChange("pending")}
              disabled={locked}
            >
              Pending
            </button>
            <button
              type="button"
              className={`btn rounded-pill px-3 ${actionStatus === "rejected" ? "btn-danger" : "btn-outline-danger"}`}
              onClick={() => onActionStatusChange("rejected")}
              disabled={locked}
            >
              Reject
            </button>
          </div>
        </div>

        <div className="mb-3">
          <label className="form-label fw-semibold">Reviewer Notes</label>
          <textarea
            className="form-control"
            rows={4}
            placeholder="Add a note for the requester..."
            value={reviewNotes}
            onChange={(event) => onNotesChange(event.target.value)}
            disabled={locked}
          />
        </div>

        <div className="d-flex justify-content-end gap-2">
          <button type="button" className="btn btn-outline-secondary rounded-pill px-3" onClick={onClose}>
            Cancel
          </button>
          <button
            type="button"
            className={`btn rounded-pill px-3 ${
              actionStatus === "approved"
                ? "btn-primary"
                : actionStatus === "rejected"
                ? "btn-danger"
                : "btn-outline-secondary"
            }`}
            disabled={submitting || locked}
            onClick={onSubmit}
          >
            {locked ? "Finalized" : submitting ? "Saving..." : `Set ${actionStatus}`}
          </button>
        </div>
      </div>
    </div>
  );
}

function DetailCard({ label, value }) {
  return (
    <div className="col-sm-6 col-lg-3">
      <div className="border rounded-4 p-3 h-100 bg-light-subtle">
        <div className="text-muted mb-1" style={{ fontSize: 12 }}>
          {label}
        </div>
        <div className="fw-bold">{value}</div>
      </div>
    </div>
  );
}

interface ApplicationRowProps {
    app: any;
    isPending: boolean;
    getStatusBadgeStyle: (status: string) => string;
    getStaticDocumentUrl: (url: string) => string;
    handleStatusChange: (id: string, status: string) => void;
    handleScoreChange: (id: string, field: "technicalScore" | "behavioralScore", value: number | null) => void;
    handleDeleteApplication: (id: string) => void;
}

export function ApplicationRow({
    app,
    isPending,
    getStatusBadgeStyle,
    getStaticDocumentUrl,
    handleStatusChange,
    handleScoreChange,
    handleDeleteApplication
}: ApplicationRowProps) {

    const experienceValue = app.yearsOfExperience ?? app.candidate.yearsOfExperience ?? 0
    const tech = app.scoreResult?.technicalScore ?? null
    const behav = app.scoreResult?.behavioralScore ?? null

    // Calculate real-time overall value matching your schema mechanics
    const computedOverall = (tech !== null && behav !== null)
        ? Math.round((tech + behav) / 2)
        : ("Pending")

    return (
        <tr className="hover:bg-zinc-50/50 transition-colors">
            {/* CANDIDATE INFO CONTAINER */}
            <td className="p-3.5">
                <div className="font-semibold text-zinc-900">{app.candidate.fullName}</div>
                <div className="text-[11px] text-zinc-500">{app.candidate.email}</div>
            </td>

            {/* JOB POSITION TITLE */}
            <td className="p-3.5 font-medium text-zinc-800">
                {app.job.title}
            </td>

            {/* EXPERIENCE BADGE */}
            <td className="p-3.5">
                <span className="inline-flex items-center px-2 py-0.5 rounded-full border border-blue-200 bg-blue-50 text-[11px] font-semibold text-blue-700">
                    {experienceValue} {experienceValue === 1 ? "yr" : "yrs"} exp
                </span>
            </td>

            {/* DISCIPLINE / FIELD OF STUDY */}
            <td className="p-3.5">
                <span className="inline-flex items-center px-2 py-0.5 rounded border border-zinc-200 bg-zinc-50 text-[11px] font-medium text-zinc-600">
                    {app.candidate.department || app.job.departments?.join(", ") || "N/A"}
                </span>
            </td>

            {/* INLINE TECHNICAL EVALUATION INPUT */}
            <td className="p-3.5">
                <input
                    type="number"
                    min="0"
                    max="100"
                    disabled={isPending}
                    defaultValue={tech ?? ""} // 🚀 Change value to defaultValue to prevent jumping
                    placeholder="—"
                    onBlur={(e) => {
                        // 🚀 Only triggers the save action when the admin clicks away
                        const val = e.target.value === "" ? null : Number(e.target.value)
                        if (val !== tech) {
                            handleScoreChange(app.id, "technicalScore", val)
                        }
                    }}
                    onKeyDown={(e) => {
                        // 🚀 Pressing Enter will automatically save and remove focus safely
                        if (e.key === "Enter") {
                            e.currentTarget.blur()
                        }
                    }}
                    className="w-16 p-1.5 font-mono text-center text-xs font-semibold bg-zinc-50 border border-zinc-200 rounded-md focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all disabled:opacity-50"
                />
            </td>

            {/* INLINE BEHAVIORAL EVALUATION INPUT */}
            <td className="p-3.5">
                <input
                    type="number"
                    min="0"
                    max="100"
                    disabled={isPending}
                    defaultValue={behav ?? ""} // 🚀 Change value to defaultValue to prevent jumping
                    placeholder="—"
                    onBlur={(e) => {
                        // 🚀 Only triggers the save action when the admin clicks away
                        const val = e.target.value === "" ? null : Number(e.target.value)
                        if (val !== behav) {
                            handleScoreChange(app.id, "behavioralScore", val)
                        }
                    }}
                    onKeyDown={(e) => {
                        // 🚀 Pressing Enter will automatically save and remove focus safely
                        if (e.key === "Enter") {
                            e.currentTarget.blur()
                        }
                    }}
                    className="w-16 p-1.5 font-mono text-center text-xs font-semibold bg-zinc-50 border border-zinc-200 rounded-md focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all disabled:opacity-50"
                />
            </td>

            {/* RE-CALCULATED LIVE OVERALL SCORE TAG */}
            <td className="p-3.5">
                {computedOverall !== null ? (
                    <span className="inline-flex items-center px-2 py-1 rounded bg-indigo-50 font-mono font-bold text-indigo-700 border border-indigo-100">
                        {computedOverall}
                    </span>
                ) : (
                    <span className="text-zinc-400 font-mono pl-2">—</span>
                )}
            </td>

            {/* VERIFICATION RESUME DOCUMENT LINK */}
            <td className="p-3.5">
                {app.documentsUrl ? (
                    <a
                        href={app.documentsUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1 bg-blue-50 text-blue-700 px-2.5 py-1 rounded-md text-xs font-semibold hover:bg-blue-100 border border-blue-200"
                    >
                        📑 Open Document
                    </a>
                ) : (
                    <span className="text-zinc-400 italic">No File</span>
                )}
            </td>

            {/* WORKFLOW STATUS STEP SELECTOR */}
            <td className="p-3.5">
                <select
                    disabled={isPending}
                    value={app.status}
                    onChange={(e) => handleStatusChange(app.id, e.target.value)}
                    className={`p-1.5 text-xs font-semibold border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 disabled:opacity-50 cursor-pointer font-medium ${getStatusBadgeStyle(app.status)}`}
                >
                    <option value="SUBMITTED">SUBMITTED</option>
                    <option value="UNDER_REVIEW">UNDER_REVIEW</option>
                    <option value="SCREENED">SCREENED</option>
                    <option value="SHORTLISTED">SHORTLISTED</option>
                    <option value="INTERVIEWING">CALL_FOR_INTERVIEW</option>
                    <option value="HIRED">HIRED</option>
                    <option value="REJECTED">REJECTED</option>
                    <option value="RESERVE_1">RESERVE 1</option>
                    <option value="RESERVE_2">RESERVE 2</option>
                    <option value="RESERVE_3">RESERVE 3</option>
                </select>
            </td>

            {/* TIMESTAMP DATE ROW */}
            <td className="p-3.5 text-zinc-500">
                {new Date(app.createdAt).toLocaleDateString()}
            </td>

            {/* RECORD ACTIONS DELETION BLOCK */}
            <td className="p-3.5 text-right">
                <button
                    onClick={() => handleDeleteApplication(app.id)}
                    disabled={isPending}
                    className="text-rose-600 hover:text-rose-800 font-medium text-xs disabled:opacity-50 transition-colors"
                >
                    Delete
                </button>
            </td>
        </tr>
    )
}

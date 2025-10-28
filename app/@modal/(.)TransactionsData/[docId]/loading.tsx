export default function TransactionSkeleton() {
  return (
    <div className="fixed inset-0 z-50 grid place-items-center bg-black/60">
      <div className="w-[90%] max-w-7xl 2xl:max-w-[1600px] h-[40vh] lg:h-[60vh] 2xl:h-[40vh] bg-[#0C1219] rounded-lg overflow-hidden border border-[#152D2D]">
        <div className="relative py-6 max-h-[80vh] overflow-y-auto">
          {/* Sticky Header */}
          <div className="flex mb-6 sticky top-0 left-0 bg-[#0C1219] z-20 w-full pb-3">
            <div className="pl-6">
              <div className="h-6 w-40 bg-gradient-to-r from-[#1e3a4a]/60 to-[#15242e]/60 rounded-lg mb-1.5 animate-pulse" />
              <div className="flex flex-row items-baseline gap-2">
                <div className="h-3.5 w-28 bg-gradient-to-r from-[#1e3a4a]/40 to-[#15242e]/40 rounded-full animate-pulse" />
                <div className="h-3 w-20 bg-gradient-to-r from-[#1e3a4a]/40 to-[#15242e]/40 rounded-full animate-pulse" />
              </div>
            </div>

            {/* Share & Close buttons */}
            <div className="absolute -top-[15px] lg:-top-[20px] right-3 z-30 flex items-center gap-3">
              <div className="w-8 h-8 rounded-full bg-gradient-to-br from-[#1e3a4a]/60 to-[#15242e]/60 animate-pulse" />
              <div className="w-8 h-8 rounded-full bg-gradient-to-br from-[#1e3a4a]/60 to-[#15242e]/60 animate-pulse" />
            </div>
          </div>

          {/* Main Content */}
          <div className="px-6 md:flex gap-10 flex-nowrap">
            {/* Left Side - Meme Media */}
            <div className="hidden md:flex flex-col w-[30%] gap-0">
              <div className="relative w-full mt-[26px] z-20 shadow-[0_3px_5px_rgba(0,96,57,0.5)]">
                <div className="w-full h-[320px] bg-gradient-to-br from-[#1e3a4a] to-[#15242e] overflow-hidden">
                  <div className="absolute inset-0 -translate-x-full animate-[shimmer_2s_infinite] bg-gradient-to-r from-transparent via-white/5 to-transparent" />
                </div>
              </div>

              {/* Earnings Badge */}
              <div className="flex justify-center w-full">
                <div className="inline-flex items-center gap-2 px-5 py-1.5 -mt-[1px] bg-[#152D2D] rounded-b-[20px] animate-pulse">
                  <div className="h-4 w-36 " />
                </div>
              </div>
            </div>

            {/* Right Side - Transaction Table */}
            <div className="w-full md:w-[70%] overflow-x-auto">
              <div className="max-h-[500px] overflow-y-auto shadow-[4px_4px_7px_rgba(0,0,0,0.4)]">
                <table className="min-w-full">
                  <thead className="bg-transparent">
                    <tr className="text-[12px] 2xl:text-[14px]">
                      <th className="px-4 py-2 text-left">
                        <div className="h-3 w-4 bg-gradient-to-r from-[#1e3a4a]/40 to-[#15242e]/40 rounded animate-pulse" />
                      </th>
                      <th className="px-4 py-2 text-left">
                        <div className="h-3 w-20 bg-gradient-to-r from-[#1e3a4a]/40 to-[#15242e]/40 rounded animate-pulse" />
                      </th>
                      <th className="px-4 py-2 text-left">
                        <div className="h-3 w-28 bg-gradient-to-r from-[#1e3a4a]/40 to-[#15242e]/40 rounded animate-pulse" />
                      </th>
                      <th className="px-4 py-2 text-left">
                        <div className="h-3 w-28 bg-gradient-to-r from-[#1e3a4a]/40 to-[#15242e]/40 rounded animate-pulse" />
                      </th>
                      <th className="px-4 py-2 text-left">
                        <div className="h-3 w-20 bg-gradient-to-r from-[#1e3a4a]/40 to-[#15242e]/40 rounded animate-pulse" />
                      </th>
                      <th className="px-4 py-2 text-left">
                        <div className="h-3 w-16 bg-gradient-to-r from-[#1e3a4a]/40 to-[#15242e]/40 rounded animate-pulse" />
                      </th>
                      <th className="px-4 py-2 text-left">
                        <div className="h-3 w-24 bg-gradient-to-r from-[#1e3a4a]/40 to-[#15242e]/40 rounded animate-pulse" />
                      </th>
                      <th className="px-4 py-2 text-left">
                        <div className="h-3 w-24 bg-gradient-to-r from-[#1e3a4a]/40 to-[#15242e]/40 rounded animate-pulse" />
                      </th>
                    </tr>
                  </thead>

                  <tbody className="bg-[#202933]/40">
                    {[...Array(4)].map((_, index) => (
                      <tr
                        key={index}
                        className={`${
                          index !== 3 ? "border-b border-[#C3C8CC]/10" : ""
                        }`}
                      >
                        {/* Index */}
                        <td className="px-4 py-4">
                          <div className="h-4 w-4 bg-gradient-to-r from-[#1e3a4a]/60 to-[#15242e]/60 rounded animate-pulse" />
                        </td>

                        {/* Timestamp */}
                        <td className="px-4 py-4">
                          <div className="space-y-1">
                            <div className="h-3.5 w-24 bg-gradient-to-r from-[#1e3a4a]/60 to-[#15242e]/60 rounded animate-pulse" />
                            <div className="h-2.5 w-20 bg-gradient-to-r from-[#1e3a4a]/40 to-[#15242e]/40 rounded animate-pulse" />
                          </div>
                        </td>

                        {/* Transaction ID */}
                        <td className="px-4 py-4">
                          <div className="flex items-center gap-2">
                            <div className="h-3.5 w-28 bg-gradient-to-r from-[#1e3a4a]/60 to-[#15242e]/60 rounded animate-pulse" />
                            <div className="w-4 h-4 rounded bg-gradient-to-br from-[#1e3a4a]/60 to-[#15242e]/60 animate-pulse" />
                          </div>
                        </td>

                        {/* Sender Address */}
                        <td className="px-4 py-4">
                          <div className="flex items-center gap-2">
                            <div className="h-3.5 w-24 bg-gradient-to-r from-[#1e3a4a]/60 to-[#15242e]/60 rounded animate-pulse" />
                            <div className="w-4 h-4 rounded bg-gradient-to-br from-[#1e3a4a]/60 to-[#15242e]/60 animate-pulse" />
                          </div>
                        </td>

                        {/* Username */}
                        <td className="px-4 py-4">
                          <div className="h-3.5 w-20 bg-gradient-to-r from-[#1e3a4a]/60 to-[#15242e]/60 rounded animate-pulse" />
                        </td>

                        {/* Amount */}
                        <td className="px-4 py-4">
                          <div className="flex items-center gap-1">
                            <div className="w-4 h-4 rounded-full bg-gradient-to-br from-[#1e3a4a]/60 to-[#15242e]/60 animate-pulse" />
                            <div className="h-3.5 w-16 bg-gradient-to-r from-[#1e3a4a]/60 to-[#15242e]/60 rounded animate-pulse" />
                          </div>
                        </td>

                        {/* Fiat Value at Send */}
                        <td className="px-4 py-4">
                          <div className="h-3.5 w-20 bg-gradient-to-r from-[#1e3a4a]/60 to-[#15242e]/60 rounded animate-pulse mx-auto" />
                        </td>

                        {/* Fiat Value Now */}
                        <td className="px-4 py-4">
                          <div className="h-3.5 w-20 bg-gradient-to-r from-[#1e3a4a]/60 to-[#15242e]/60 rounded animate-pulse mx-auto" />
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

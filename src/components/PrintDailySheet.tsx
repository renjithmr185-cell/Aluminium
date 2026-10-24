import React from 'react';
import { CompanyProfile, DailySummary, Transaction } from '../types';
import { formatCurrency } from '../utils/storage';

interface PrintDailySheetProps {
  company: CompanyProfile;
  summary: DailySummary;
  transactions: Transaction[];
  selectedDate: string;
}

export const PrintDailySheet: React.FC<PrintDailySheetProps> = ({
  company,
  summary,
  transactions,
  selectedDate,
}) => {
  const dayTransactions = transactions.filter((t) => t.date === selectedDate);
  const currency = company.currency;
  const decimals = company.decimals;

  const dateObj = new Date(selectedDate + 'T00:00:00');
  const formattedDate = dateObj.toLocaleDateString('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });

  const nowPrintTime = new Date().toLocaleString('en-US');

  return (
    <div className="print-only print-container p-6 text-black bg-white">
      {/* Company Header */}
      <div className="border-b-2 border-slate-900 pb-4 mb-4 flex justify-between items-start">
        <div className="space-y-1">
          <h1 className="text-2xl font-black uppercase tracking-tight text-slate-900">
            {company.name || 'Company Name'}
          </h1>
          {company.tagline && (
            <p className="text-xs text-slate-600 font-medium">{company.tagline}</p>
          )}
          {company.address && (
            <p className="text-[11px] text-slate-500">{company.address}</p>
          )}
          <div className="text-[11px] text-slate-500 flex items-center gap-3">
            {company.phone && <span>Tel: {company.phone}</span>}
            {company.email && <span>Email: {company.email}</span>}
            {company.taxId && <span>Tax/Reg ID: {company.taxId}</span>}
          </div>
        </div>

        <div className="text-right">
          <div className="inline-block bg-slate-900 text-white font-extrabold text-xs px-3 py-1 rounded mb-1 uppercase tracking-wider">
            Daily Audit Statement
          </div>
          <h2 className="text-base font-extrabold text-slate-800">
            DAILY CASH &amp; BANK REPORT
          </h2>
          <p className="text-xs font-bold text-slate-700">{formattedDate}</p>
          <p className="text-[10px] text-slate-400">Generated: {nowPrintTime}</p>
        </div>
      </div>

      {/* Opening & Closing Balances Grid */}
      <div className="grid grid-cols-2 gap-4 mb-4">
        {/* Cash Box */}
        <div className="border border-slate-300 rounded p-2.5 bg-slate-50 text-xs">
          <div className="font-bold border-b border-slate-300 pb-1 mb-1.5 flex justify-between uppercase text-slate-800">
            <span>Cash Drawer Account</span>
            <span>Physical Cash</span>
          </div>
          <div className="flex justify-between py-0.5">
            <span className="text-slate-600">Start of Day Opening Cash:</span>
            <span className="font-mono font-bold">
              {formatCurrency(summary.openingCash, currency, decimals)}
            </span>
          </div>
          <div className="flex justify-between py-0.5 text-emerald-700 font-semibold">
            <span>(+) Total Cash Inflow:</span>
            <span className="font-mono">
              +{formatCurrency(summary.cashIn, currency, decimals)}
            </span>
          </div>
          <div className="flex justify-between py-0.5 text-rose-700 font-semibold">
            <span>(-) Total Cash Outflow:</span>
            <span className="font-mono">
              -{formatCurrency(summary.cashOut, currency, decimals)}
            </span>
          </div>
          <div className="flex justify-between pt-1 border-t border-slate-300 font-extrabold text-slate-900">
            <span>End of Day Closing Cash:</span>
            <span className="font-mono text-emerald-800">
              {formatCurrency(summary.closingCash, currency, decimals)}
            </span>
          </div>
        </div>

        {/* Bank Box */}
        <div className="border border-slate-300 rounded p-2.5 bg-slate-50 text-xs">
          <div className="font-bold border-b border-slate-300 pb-1 mb-1.5 flex justify-between uppercase text-slate-800">
            <span>Bank Account</span>
            <span>Deposits &amp; Transfers</span>
          </div>
          <div className="flex justify-between py-0.5">
            <span className="text-slate-600">Start of Day Opening Bank:</span>
            <span className="font-mono font-bold">
              {formatCurrency(summary.openingBank, currency, decimals)}
            </span>
          </div>
          <div className="flex justify-between py-0.5 text-sky-700 font-semibold">
            <span>(+) Total Received Bank:</span>
            <span className="font-mono">
              +{formatCurrency(summary.bankIn, currency, decimals)}
            </span>
          </div>
          <div className="flex justify-between py-0.5 text-purple-700 font-semibold">
            <span>(-) Total Bank Outflow:</span>
            <span className="font-mono">
              -{formatCurrency(summary.bankOut, currency, decimals)}
            </span>
          </div>
          <div className="flex justify-between pt-1 border-t border-slate-300 font-extrabold text-slate-900">
            <span>End of Day Closing Bank:</span>
            <span className="font-mono text-sky-800">
              {formatCurrency(summary.closingBank, currency, decimals)}
            </span>
          </div>
        </div>
      </div>

      {/* Combined Liquidity Banner */}
      <div className="bg-slate-100 border border-slate-300 p-2 rounded mb-4 flex justify-between items-center text-xs font-bold text-slate-900">
        <span>TOTAL END-OF-DAY COMBINED CLOSING LIQUIDITY (CASH + BANK):</span>
        <span className="font-mono text-sm font-extrabold">
          {formatCurrency(summary.totalClosingLiquidity, currency, decimals)}
        </span>
      </div>

      {/* Transactions Table */}
      <div className="mb-6">
        <h3 className="text-xs font-bold uppercase tracking-wider mb-1.5 text-slate-800">
          Itemized Transactions Register ({dayTransactions.length} Items)
        </h3>
        <table className="w-full text-[10px] border-collapse border border-slate-300">
          <thead>
            <tr className="bg-slate-200 text-slate-900 font-bold uppercase">
              <th className="border border-slate-300 px-2 py-1 text-center w-8">#</th>
              <th className="border border-slate-300 px-2 py-1 text-center w-14">Time</th>
              <th className="border border-slate-300 px-2 py-1 text-left w-20">Type</th>
              <th className="border border-slate-300 px-2 py-1 text-left">Category / Particulars</th>
              <th className="border border-slate-300 px-2 py-1 text-left w-24">Voucher/Ref</th>
              <th className="border border-slate-300 px-2 py-1 text-left w-20">Channel</th>
              <th className="border border-slate-300 px-2 py-1 text-right w-24">Inflow (+)</th>
              <th className="border border-slate-300 px-2 py-1 text-right w-24">Outflow (-)</th>
            </tr>
          </thead>
          <tbody>
            {dayTransactions.length === 0 ? (
              <tr>
                <td colSpan={8} className="border border-slate-300 text-center py-4 text-slate-500">
                  No financial movements recorded for this date.
                </td>
              </tr>
            ) : (
              dayTransactions.map((tx, idx) => {
                const isInflow = tx.type === 'cash_in' || tx.type === 'bank_in';
                const typeLabel =
                  tx.type === 'cash_in'
                    ? 'Cash In'
                    : tx.type === 'cash_out'
                    ? 'Cash Out'
                    : tx.type === 'bank_in'
                    ? 'Bank In'
                    : 'Bank Out';

                return (
                  <tr key={tx.id} className="border-b border-slate-200">
                    <td className="border border-slate-300 px-2 py-1 text-center font-mono">
                      {idx + 1}
                    </td>
                    <td className="border border-slate-300 px-2 py-1 text-center font-mono">
                      {tx.time || '—'}
                    </td>
                    <td className="border border-slate-300 px-2 py-1 font-bold">
                      {typeLabel}
                    </td>
                    <td className="border border-slate-300 px-2 py-1">
                      <span className="font-bold">{tx.category}</span>
                      {tx.description && <span className="text-slate-600 block">{tx.description}</span>}
                    </td>
                    <td className="border border-slate-300 px-2 py-1 font-mono">
                      {tx.reference || '—'}
                    </td>
                    <td className="border border-slate-300 px-2 py-1">
                      {tx.paymentMethod}
                    </td>
                    <td className="border border-slate-300 px-2 py-1 text-right font-mono font-bold">
                      {isInflow ? formatCurrency(tx.amount, currency, decimals) : '—'}
                    </td>
                    <td className="border border-slate-300 px-2 py-1 text-right font-mono font-bold">
                      {!isInflow ? formatCurrency(tx.amount, currency, decimals) : '—'}
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
          <tfoot className="bg-slate-100 font-bold">
            <tr>
              <td colSpan={6} className="border border-slate-300 px-2 py-1.5 text-right uppercase">
                Daily Totals:
              </td>
              <td className="border border-slate-300 px-2 py-1.5 text-right font-mono">
                +{formatCurrency(summary.cashIn + summary.bankIn, currency, decimals)}
              </td>
              <td className="border border-slate-300 px-2 py-1.5 text-right font-mono">
                -{formatCurrency(summary.cashOut + summary.bankOut, currency, decimals)}
              </td>
            </tr>
          </tfoot>
        </table>
      </div>

      {/* Signatures & Authorizations */}
      <div className="mt-12 pt-6 border-t border-slate-400 grid grid-cols-3 gap-8 text-center text-xs">
        <div>
          <div className="h-10"></div>
          <div className="border-t border-dashed border-slate-500 pt-1 font-bold text-slate-800">
            Prepared By (Cashier)
          </div>
          <span className="text-[10px] text-slate-400">Signature &amp; Date</span>
        </div>

        <div>
          <div className="h-10"></div>
          <div className="border-t border-dashed border-slate-500 pt-1 font-bold text-slate-800">
            Verified By (Accountant)
          </div>
          <span className="text-[10px] text-slate-400">Signature &amp; Date</span>
        </div>

        <div>
          <div className="h-10"></div>
          <div className="border-t border-dashed border-slate-500 pt-1 font-bold text-slate-800">
            Authorized Signatory
          </div>
          <span className="text-[10px] text-slate-400">Manager / Director</span>
        </div>
      </div>
    </div>
  );
};

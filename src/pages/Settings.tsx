import { useState } from 'react';
import { Save } from 'lucide-react';

const tabs = ['Company Profile', 'Business Hours', 'SLA Settings', 'Notifications', 'Email Alerts', 'Role Permissions'];

export default function Settings() {
  const [activeTab, setActiveTab] = useState(tabs[0]);
  const [saved, setSaved] = useState(false);

  const handleSave = () => { setSaved(true); setTimeout(() => setSaved(false), 2000); };

  return (
    <div className="space-y-6 p-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Settings</h1>
        <p className="text-sm text-gray-500">Configure your ReplyRoute workspace</p>
      </div>

      <div className="flex gap-6">
        {/* Tabs */}
        <div className="w-48 shrink-0 space-y-0.5">
          {tabs.map(tab => (
            <button key={tab} onClick={() => setActiveTab(tab)}
              className={`w-full rounded-lg px-3 py-2 text-left text-sm transition-colors ${activeTab === tab ? 'bg-ocean-50 text-ocean-700 font-medium' : 'text-gray-600 hover:bg-gray-50'}`}>
              {tab}
            </button>
          ))}
        </div>

        {/* Content */}
        <div className="flex-1 rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
          {activeTab === 'Company Profile' && (
            <div className="space-y-4 max-w-lg">
              <h3 className="text-base font-semibold text-gray-900">Company Profile</h3>
              {[
                { label: 'Company Name', value: 'Yeti Airlines', placeholder: 'Company name' },
                { label: 'Industry', value: 'Aviation / Airlines', placeholder: 'Industry' },
                { label: 'Website', value: 'https://yetiairlines.com', placeholder: 'Website URL' },
                { label: 'Contact Email', value: 'info@yetiairlines.com', placeholder: 'Email' },
                { label: 'Phone', value: '+977-1-4465888', placeholder: 'Phone' },
                { label: 'Address', value: 'Kathmandu, Nepal', placeholder: 'Address' },
              ].map(f => (
                <div key={f.label} className="space-y-1">
                  <label className="text-xs font-medium text-gray-600">{f.label}</label>
                  <input defaultValue={f.value} className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm outline-none focus:border-ocean-500" placeholder={f.placeholder} />
                </div>
              ))}
            </div>
          )}
          {activeTab === 'Business Hours' && (
            <div className="space-y-4 max-w-lg">
              <h3 className="text-base font-semibold text-gray-900">Business Hours</h3>
              <p className="text-xs text-gray-500">Set when your team is available to respond</p>
              {['Sunday','Monday','Tuesday','Wednesday','Thursday','Friday'].map(day => (
                <div key={day} className="flex items-center gap-4">
                  <span className="w-24 text-sm text-gray-700">{day}</span>
                  <input defaultValue="09:00" type="time" className="rounded-lg border border-gray-300 px-2 py-1.5 text-sm" />
                  <span className="text-gray-400">to</span>
                  <input defaultValue="17:00" type="time" className="rounded-lg border border-gray-300 px-2 py-1.5 text-sm" />
                </div>
              ))}
            </div>
          )}
          {activeTab === 'SLA Settings' && (
            <div className="space-y-4 max-w-lg">
              <h3 className="text-base font-semibold text-gray-900">SLA Settings</h3>
              <p className="text-xs text-gray-500">Define response time targets by priority</p>
              {[['Urgent','2 hours'],['High','4 hours'],['Medium','8 hours'],['Low','24 hours']].map(([p,v]) => (
                <div key={p} className="flex items-center gap-4">
                  <span className="w-24 text-sm font-medium text-gray-700">{p}</span>
                  <input defaultValue={v} className="flex-1 rounded-lg border border-gray-300 px-3 py-2 text-sm outline-none focus:border-ocean-500" />
                </div>
              ))}
            </div>
          )}
          {(activeTab === 'Notifications' || activeTab === 'Email Alerts') && (
            <div className="space-y-4 max-w-lg">
              <h3 className="text-base font-semibold text-gray-900">{activeTab}</h3>
              {['New inquiry received','SLA breach warning','Escalation triggered','Daily summary report','Weekly analytics digest'].map(item => (
                <label key={item} className="flex items-center justify-between py-2 border-b border-gray-100 cursor-pointer">
                  <span className="text-sm text-gray-700">{item}</span>
                  <input type="checkbox" defaultChecked className="accent-ocean-500 h-4 w-4" />
                </label>
              ))}
            </div>
          )}
          {activeTab === 'Role Permissions' && (
            <div className="space-y-4">
              <h3 className="text-base font-semibold text-gray-900">Role Permissions</h3>
              <table className="w-full text-sm">
                <thead><tr className="border-b"><th className="py-2 text-left text-xs font-semibold text-gray-500">Permission</th>
                  {['Admin','Manager','Agent'].map(r => <th key={r} className="py-2 text-center text-xs font-semibold text-gray-500">{r}</th>)}</tr></thead>
                <tbody>{['View inbox','Assign inquiries','Change department','Escalate','View analytics','Manage routing rules','Manage team','Manage settings'].map(p => (
                  <tr key={p} className="border-b border-gray-50"><td className="py-2 text-gray-700">{p}</td>
                    {[true, true, p === 'View inbox' || p === 'Assign inquiries'].map((v, i) => (
                      <td key={i} className="py-2 text-center"><input type="checkbox" defaultChecked={v} className="accent-ocean-500" /></td>
                    ))}</tr>
                ))}</tbody>
              </table>
            </div>
          )}
          <div className="mt-6 pt-4 border-t border-gray-100">
            <button onClick={handleSave} className="flex items-center gap-2 rounded-lg bg-gradient-to-r from-ocean-500 to-teal-500 px-5 py-2 text-sm font-semibold text-white hover:opacity-90 transition-opacity">
              <Save size={16} /> {saved ? 'Saved!' : 'Save Changes'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

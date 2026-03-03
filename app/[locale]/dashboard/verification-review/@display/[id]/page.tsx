import { getVerificationRequestByIdAction } from '@/modules/verification-review/actions';
import AutomatedChecksResults from '@/modules/verification-review/components/automated-checks-results';
import DetailItem from '@/modules/verification-review/components/detail-item';
import DocumentCard from '@/modules/verification-review/components/document-card';
import { calculateAge } from '@/modules/verification-review/utils/age.utils';

export default async function DisplayIdPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const result = await getVerificationRequestByIdAction(id);

  if (!result.success) {
    return (
      <div className="flex h-full items-center justify-center p-8">
        <p className="text-sm text-red-500">
          Failed to load verification request.
        </p>
      </div>
    );
  }

  const { request, user } = result.data;

  return (
    <div className="flex h-full flex-col overflow-y-auto">
      {/* Header */}
      <div className="border-b border-gray-200 p-4 dark:border-gray-700">
        <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
          {request.id_full_name}
        </h2>
        <p className="text-sm text-gray-500 dark:text-gray-400">
          Request ID: {request.verification_request_id.slice(0, 8)}...
        </p>
      </div>

      {/* Content */}
      <div className="flex-1 space-y-6 p-4">
        {/* Personal Details */}
        <section>
          <h3 className="mb-3 text-sm font-semibold tracking-wide text-gray-500 uppercase dark:text-gray-400">
            Personal Details
          </h3>
          <div className="grid grid-cols-2 gap-4">
            <DetailItem label="Full Name" value={request.id_full_name} />
            <DetailItem
              label="Date of Birth"
              value={
                request.id_date_of_birth
                  ? `${request.id_date_of_birth} (${calculateAge(request.id_date_of_birth)} years)`
                  : '—'
              }
            />
            <DetailItem label="Gender" value={request.id_gender || '—'} />
            <DetailItem
              label="National ID"
              value={request.national_id_number}
            />
            <DetailItem label="Address" value={request.address} />
            <DetailItem label="Phone" value={user.phone_number || '—'} />
            <DetailItem label="Email" value={user.email || '—'} />
            <DetailItem label="Document Type" value={request.document_type} />
          </div>
        </section>

        {/* Automated Checks Results */}
        <AutomatedChecksResults request={request} />

        {/* Social Links */}
        {(user.facebook_link_url ||
          user.instagram_link_url ||
          user.twitter_link_url ||
          user.website_url) && (
          <section>
            <h3 className="mb-3 text-sm font-semibold tracking-wide text-gray-500 uppercase dark:text-gray-400">
              Social Links
            </h3>
            <div className="grid grid-cols-2 gap-4">
              {user.facebook_link_url && (
                <DetailItem label="Facebook" value={user.facebook_link_url} />
              )}
              {user.instagram_link_url && (
                <DetailItem label="Instagram" value={user.instagram_link_url} />
              )}
              {user.twitter_link_url && (
                <DetailItem label="Twitter" value={user.twitter_link_url} />
              )}
              {user.website_url && (
                <DetailItem label="Website" value={user.website_url} />
              )}
            </div>
          </section>
        )}

        {/* Documents */}
        <section>
          <h3 className="mb-3 text-sm font-semibold tracking-wide text-gray-500 uppercase dark:text-gray-400">
            Submitted Documents
          </h3>
          <div className="grid grid-cols-3 gap-4">
            <DocumentCard
              label="Front of ID"
              imageUrl={request.document_front_url}
            />
            <DocumentCard
              label="Back of ID"
              imageUrl={request.document_back_url}
            />
            <DocumentCard
              label="Selfie with ID"
              imageUrl={request.selfie_with_id_url}
            />
          </div>
        </section>

        {/* Activity History */}
        <section>
          <h3 className="mb-3 text-sm font-semibold tracking-wide text-gray-500 uppercase dark:text-gray-400">
            Activity History
          </h3>
          <div className="grid grid-cols-2 gap-4">
            <DetailItem
              label="Account Created"
              value={
                user.created_at
                  ? new Date(user.created_at).toLocaleDateString()
                  : '—'
              }
            />
            <DetailItem
              label="Last Active"
              value={
                user.last_activity_at
                  ? new Date(user.last_activity_at).toLocaleDateString()
                  : '—'
              }
            />
            <DetailItem
              label="Verified"
              value={user.is_verified ? 'Yes' : 'No'}
            />
            <DetailItem
              label="Status"
              value={user.is_active ? 'Active' : 'Inactive'}
            />
          </div>
        </section>
      </div>
    </div>
  );
}

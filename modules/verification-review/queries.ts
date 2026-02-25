'use server';

import { revalidatePath } from 'next/cache';
import { createClient } from '@/lib/supabase/server';
import { authHandler } from '@/utils/auth-handler';
import CustomError from '@/utils/CustomError';
import {
    ChecklistState,
    VerificationQueueItem,
    VerificationRequestDetail,
    VerificationStatus,
    VerificationUserDetail,
} from './types';
import { DEFAULT_LIMIT_NUMBER, DEFAULT_PAGE_NUMBER } from '@/constants/pagination';

/**
 * Fetch pending verification requests for the queue list.
 * Supports search by user name and pagination.
 */
export async function getVerificationQueueQuery({
    query = '',
    page = DEFAULT_PAGE_NUMBER,
}: {
    query?: string;
    page?: number;
} = {}): Promise<{
    items: VerificationQueueItem[];
    totalCount: number;
    page: number;
    pageSize: number;
}> {
    const supabase = await createClient();
    await authHandler();

    const from = (page - 1) * DEFAULT_LIMIT_NUMBER;
    const to = from + DEFAULT_LIMIT_NUMBER - 1;

    let request = supabase
        .from('verification_requests')
        .select(
            `
      verification_request_id,
      user_id,
      submitted_at,
      priority,
      verification_status,
      users!verification_requests_user_id_fkey (
        first_name,
        last_name,
        avatar_url
      )
    `,
            { count: 'exact' }
        )
        .eq('verification_status', 'pending')
        .order('submitted_at', { ascending: true });

    // Apply search filter on user name if query is provided
    if (query.trim()) {
        request = request.or(
            `id_full_name.ilike.%${query}%,national_id_number.ilike.%${query}%`
        );
    }

    // Apply pagination
    request = request.range(from, to);

    const { data, error, count } = await request;

    if (error) {
        console.error('Error fetching verification queue:', error);
        throw new CustomError({
            message: error.message || 'Failed to fetch verification queue',
        });
    }

    // Flatten the joined user data
    const items = (data || []).map((item) => {
        const user = item.users as unknown as {
            first_name: string;
            last_name: string;
            avatar_url: string | null;
        };

        return {
            verification_request_id: item.verification_request_id,
            user_id: item.user_id,
            full_name: `${user?.first_name ?? ''} ${user?.last_name ?? ''}`.trim(),
            avatar_url: user?.avatar_url ?? null,
            submitted_at: item.submitted_at,
            priority: item.priority,
            verification_status: item.verification_status,
        };
    });

    return {
        items,
        totalCount: count ?? 0,
        page,
        pageSize: DEFAULT_LIMIT_NUMBER,
    };
}

/**
 * Fetch a single verification request with full user details.
 */
export async function getVerificationRequestByIdQuery(
    requestId: string
): Promise<{
    request: VerificationRequestDetail;
    user: VerificationUserDetail;
}> {
    const supabase = await createClient();
    await authHandler();

    // Fetch the verification request
    const { data: request, error: requestError } = await supabase
        .from('verification_requests')
        .select('*')
        .eq('verification_request_id', requestId)
        .single();

    if (requestError || !request) {
        console.error('Error fetching verification request:', requestError);
        throw new CustomError({
            message:
                requestError?.message || 'Verification request not found',
        });
    }

    // Fetch user details from the view (includes email)
    const { data: user, error: userError } = await supabase
        .from('users_with_email')
        .select('*')
        .eq('user_id', request.user_id)
        .single();

    if (userError || !user) {
        console.error('Error fetching user details:', userError);
        throw new CustomError({
            message: userError?.message || 'User not found',
        });
    }

    return { request, user };
}

/**
 * Update the verification status and related fields for a request.
 */
export async function updateVerificationStatusQuery({
    requestId,
    status,
    reviewNotes,
    rejectionReason,
    checklist,
}: {
    requestId: string;
    status: VerificationStatus;
    reviewNotes?: string;
    rejectionReason?: string;
    checklist?: ChecklistState;
}) {
    const supabase = await createClient();
    const reviewer = await authHandler();

    console.log({ requestId, status, reviewNotes, rejectionReason, checklist })

    const { error } = await supabase
        .from('verification_requests')
        .update({
            verification_status: status,
            review_notes: reviewNotes || null,
            rejection_reason: rejectionReason || null,
            reviewed_at: new Date().toISOString(),
            assigned_to: reviewer.id,
            // Spread checklist booleans if provided
            ...(checklist && {
                name_matches: checklist.name_matches,
                age_verified: checklist.age_verified,
                id_number_valid: checklist.id_number_valid,
                address_verified: checklist.address_verified,
                face_matches_id: checklist.face_matches_id,
                document_not_expired: checklist.document_not_expired,
                no_tampering_signs: checklist.no_tampering_signs,
                selfie_is_live: checklist.selfie_is_live,
            }),
        })
        .eq('verification_request_id', requestId)
        .single();

    if (error) {
        console.error('Error updating verification status:', error);
        throw new CustomError({
            message: error.message || 'Failed to update verification status',
        });
    }

    // If approved, update the user's is_verified flag
    if (status === 'approved') {
        // First get the user_id from the request
        const { data: request } = await supabase
            .from('verification_requests')
            .select('user_id')
            .eq('verification_request_id', requestId)
            .single();

        if (request) {
            await supabase
                .from('users')
                .update({ user_role: 'verified_seller' })
                .eq('user_id', request.user_id);
        }
    }

    revalidatePath('/dashboard/verification-review');

    return { success: true };
}

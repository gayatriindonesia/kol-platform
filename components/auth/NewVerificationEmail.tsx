"use client";

// import { ExclamationTriangleIcon } from '@radix-ui/react-icons'
import { useCallback, useEffect, useState } from 'react'
import { Button } from '../ui/button'
import { useSearchParams } from 'next/navigation';
import { BeatLoader } from 'react-spinners'
import { newVerification } from '@/lib/verification.actions';
import { FormSuccess } from '../FormSuccess';
import { FormError } from '../FormError';

const NewVerificationEmail = () => {
    const [error, setError] = useState<string | undefined>();
    const [success, setSuccess] = useState<string | undefined>();

    const searchParams = useSearchParams();

    const token = searchParams.get("token");

    const onSubmit = useCallback(() => {
         console.log( "Ini callback token", token)
        if (!token) {
            setError("Missing token!");
            return;
        }

        newVerification(token)
        .then((data) => {
            setSuccess(data.success);
            setError(data.error);
        })
        .catch(() => {
            setError("ada yang salah")
        })
    }, [token]);

    useEffect(() => {
        onSubmit()
    }, [onSubmit])

    return (
        <div className='w-full min-h-[50vh] flex flex-col items-center justify-center gap-4 text-center'>
            {!success && !error && (
                <BeatLoader />
            )}
            
            <FormSuccess message={success} />
            <FormError message={error} />
            
            <h2 className='text-xl font-semibold'>Okee! konfirmasi email!</h2>
            <p className='text-muted-foreground mb-2'>Lanjutkan untuk autentikasi</p>
            <Button>Kembali</Button>
        </div>
    )
}

export default NewVerificationEmail

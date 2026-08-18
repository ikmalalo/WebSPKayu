import React from 'react'

interface ErrorBoundaryProps {
  children: React.ReactNode
}

interface ErrorBoundaryState {
  hasError: boolean
  errorMessage: string
}

export class ErrorBoundary extends React.Component<
  ErrorBoundaryProps,
  ErrorBoundaryState
> {
  constructor(
    props: ErrorBoundaryProps
  ) {
    super(props)

    this.state = {
      hasError: false,
      errorMessage: '',
    }
  }

  static getDerivedStateFromError(
    error: Error
  ): ErrorBoundaryState {
    return {
      hasError: true,
      errorMessage:
        error?.message ||
        'Terjadi kesalahan pada halaman.',
    }
  }

  componentDidCatch(
    error: Error,
    errorInfo: React.ErrorInfo
  ) {
    console.error(
      'PAGE ERROR:',
      error
    )

    console.error(
      'ERROR INFO:',
      errorInfo
    )
  }

  handleReload = () => {
    window.location.reload()
  }

  handleBack = () => {
    window.history.back()
  }

  render() {
    if (
      !this.state.hasError
    ) {
      return this.props.children
    }

    return (
      <div className="min-h-[70vh] flex items-center justify-center p-6">
        <div className="max-w-md w-full text-center">
          <div className="w-16 h-16 mx-auto mb-5 rounded-2xl bg-red-50 flex items-center justify-center">
            <span className="text-2xl font-bold text-red-600">
              !
            </span>
          </div>

          <h2 className="text-xl font-bold text-slate-900 dark:text-slate-100">
            Halaman mengalami masalah
          </h2>

          <p className="text-sm text-slate-500 dark:text-slate-400 mt-2">
            Terjadi kesalahan saat memuat
            halaman ini. Data Anda tidak
            hilang.
          </p>

          {import.meta.env.DEV && (
            <div className="mt-4 p-3 text-left bg-slate-100 dark:bg-slate-900 rounded-lg border border-slate-200 dark:border-slate-800">
              <p className="text-xs font-mono text-red-600 dark:text-red-400 break-words">
                {this.state.errorMessage}
              </p>
            </div>
          )}

          <div className="flex justify-center gap-2 mt-6">
            <button
              type="button"
              onClick={
                this.handleBack
              }
              className="px-4 py-2 text-sm font-medium rounded-lg border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
            >
              Kembali
            </button>

            <button
              type="button"
              onClick={
                this.handleReload
              }
              className="px-4 py-2 text-sm font-medium rounded-lg bg-green-600 text-white hover:bg-green-700 transition-colors"
            >
              Muat Ulang
            </button>
          </div>
        </div>
      </div>
    )
  }
}
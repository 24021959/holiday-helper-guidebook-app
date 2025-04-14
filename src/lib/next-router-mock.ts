
// Simple mock for next/navigation router
export const useRouter = () => {
  return {
    push: (path: string) => {
      console.log(`Mock router navigation to: ${path}`);
    },
    back: () => {
      console.log('Mock router back navigation');
    },
    pathname: '/',
    query: {},
  };
};

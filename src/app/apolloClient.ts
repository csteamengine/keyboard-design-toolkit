import { ApolloClient, InMemoryCache, createHttpLink } from "@apollo/client"
import { setContext } from "@apollo/client/link/context"
import { supabase } from "./supabaseClient.ts"
const supabaseRef = import.meta.env.VITE_SUPABASE_REF as string
const anonKey = import.meta.env.VITE_SUPABASE_ANON_KEY as string

const httpLink = createHttpLink({
  uri: `https://${String(supabaseRef)}.supabase.co/graphql/v1`,
})

const authLink = setContext(async (_, { headers }) => {
  const {
    data: { session },
  } = await supabase.auth.getSession()

  const token = session?.access_token

  return {
    headers: {
      ...(headers as Record<string, string>),
      authorization: token ? `Bearer ${token}` : "",
      apikey: anonKey,
    },
  }
})

export const apolloClient = new ApolloClient({
  link: authLink.concat(httpLink),
  cache: new InMemoryCache(),
})

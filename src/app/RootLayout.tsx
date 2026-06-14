import { Link, Outlet } from 'react-router-dom'
import styled from 'styled-components'

export function RootLayout() {
  return (
    <Shell>
      <Header>
        <Brand to="/resources">Resources</Brand>
      </Header>
      <Main>
        <Outlet />
      </Main>
    </Shell>
  )
}

const Shell = styled.div`
  min-height: 100vh;
  display: flex;
  flex-direction: column;
`

const Header = styled.header`
  padding: ${({ theme }) => theme.spacing.lg} ${({ theme }) => theme.spacing.xl};
  border-bottom: 1px solid ${({ theme }) => theme.colors.border};
  background: ${({ theme }) => theme.colors.surface};
`

const Brand = styled(Link)`
  font-family: ${({ theme }) => theme.typography.heading};
  font-size: 1.25rem;
  font-weight: 600;
  color: ${({ theme }) => theme.colors.inkStrong};
`

const Main = styled.main`
  flex: 1;
  width: 100%;
  max-width: 1100px;
  margin: 0 auto;
  padding: ${({ theme }) => theme.spacing.xl};
`

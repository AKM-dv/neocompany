import { useCMS } from '../../context/CMSContext'
import HeroBanner from '../../components/HeroBanner'
import './StaticPage.css'

export default function AboutUs() {
  const { cms } = useCMS()
  const html = cms.about_html || '<p>Content coming soon.</p>'
  return (
    <>
      <HeroBanner compact />
      <div className="static-page">
        <div className="container static-inner cms-content" dangerouslySetInnerHTML={{ __html: html }} />
      </div>
    </>
  )
}

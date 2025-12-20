import { InfoBox } from '@app/components/info-box/InfoBox';
import { ContentHeader, SmallBox } from '@components';
import {
  faBookmark,
  faEnvelope,
  faChartSimple,
  faCartShopping,
  faUserPlus,
  faChartPie,
} from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';

const Dashboard = () => {
  return (
    <div>
      <ContentHeader title="Dashboard" />

      <section className="p-4">
        <div className="container mx-auto">
          {/* Row 1: Small Boxes */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
            <div>
              <SmallBox
                title="New Orders"
                text="150"
                navigateTo="#"
                variant="info"
                icon={{
                  content: (
                    <FontAwesomeIcon
                      icon={faCartShopping}
                      className="text-6xl"
                    />
                  ),
                }}
              />
            </div>
            <div>
              <SmallBox
                title="Bounce Rate"
                text="53 %"
                navigateTo="#"
                variant="success"
                icon={{
                  content: (
                    <FontAwesomeIcon
                      icon={faChartSimple}
                      className="text-6xl"
                    />
                  ),
                }}
                loading
              />
            </div>
            <div>
              <SmallBox
                title="User Registrations"
                text="44"
                navigateTo="#"
                variant="warning"
                icon={{
                  content: (
                    <FontAwesomeIcon
                      icon={faUserPlus}
                      className="text-6xl"
                    />
                  ),
                }}
                loading="dark"
              />
            </div>
            <div>
              <SmallBox
                title="Unique Visitors"
                text="65"
                navigateTo="#"
                variant="danger"
                icon={{
                  content: (
                    <FontAwesomeIcon
                      icon={faChartPie}
                      className="text-6xl"
                    />
                  ),
                  variant: 'success',
                }}
              />
            </div>
          </div>

          {/* Row 2: Info Boxes */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
            <div>
              <InfoBox
                title="Messages"
                text="1,410"
                icon={{
                  content: <FontAwesomeIcon icon={faEnvelope} />,
                  variant: 'info',
                }}
              />
            </div>
            <div>
              <InfoBox
                variant="success"
                title="Messages"
                loading="dark"
                text="1,410"
                icon={{ content: <FontAwesomeIcon icon={faEnvelope} /> }}
              />
            </div>
            <div>
              <InfoBox
                variant="warning"
                title="Messages"
                text="1,410"
                icon={{ content: <FontAwesomeIcon icon={faEnvelope} /> }}
              />
            </div>
            <div>
              <InfoBox
                variant="danger"
                title="Messages"
                text="1,410"
                icon={{ content: <FontAwesomeIcon icon={faEnvelope} /> }}
              />
            </div>
          </div>

          {/* Row 3: Progress Info Boxes */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div>
              <InfoBox
                icon={{
                  content: <FontAwesomeIcon icon={faBookmark} />,
                  variant: 'info',
                }}
                title="Bookmarks"
                text="41,410"
                progressBar={{
                  description: '70% Increase in 30 Days',
                  level: 70,
                  variant: 'success',
                }}
              />
            </div>
            <div>
              <InfoBox
                icon={{ content: <FontAwesomeIcon icon={faBookmark} /> }}
                variant="success"
                title="Bookmarks"
                text="41,410"
                progressBar={{
                  description: '70% Increase in 30 Days',
                  level: 70,
                  variant: 'light',
                }}
              />
            </div>
            <div>
              <InfoBox
                icon={{ content: <FontAwesomeIcon icon={faBookmark} /> }}
                variant="warning"
                title="Bookmarks"
                text="41,410"
                loading
                progressBar={{
                  description: '70% Increase in 30 Days',
                  level: 70,
                  variant: 'dark',
                }}
              />
            </div>
            <div>
              <InfoBox
                icon={{ content: <FontAwesomeIcon icon={faBookmark} /> }}
                variant="danger"
                title="Bookmarks"
                text="41,410"
                progressBar={{
                  description: '70% Increase in 30 Days',
                  level: 70,
                  variant: 'light',
                }}
              />
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Dashboard;

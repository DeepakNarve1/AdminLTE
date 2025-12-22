import { useState } from "react";
import { useTranslation } from "react-i18next";
import { ContentHeader } from "@components";
import Image from "@app/components/Image";
import ActivityTab from "./ActivityTab";
import TimelineTab from "./TimelineTab";
import SettingsTab from "./SettingsTab";
import { useAppSelector } from "@app/store/store";

const Profile = () => {
  const [activeTab, setActiveTab] = useState("ACTIVITY");
  const [t] = useTranslation();
  const currentUser = useAppSelector((state) => state.auth.currentUser);

  const toggle = (tab: string) => {
    if (activeTab !== tab) setActiveTab(tab);
  };

  return (
    <>
      <ContentHeader title="Profile" />
      <section className="p-6">
        <div className="container mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <div className="md:col-span-1">
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 mb-6">
                <div className="p-6 text-center">
                  <div className="flex justify-center mb-4">
                    <div className="p-1 border-4 border-gray-300 rounded-full inline-block">
                      <Image
                        width={100}
                        height={100}
                        rounded
                        src={currentUser?.photoURL}
                        fallbackSrc="/img/default-profile.png"
                        alt="User profile"
                      />
                    </div>
                  </div>
                  <h3 className="text-xl font-semibold text-gray-800 text-center mb-1">
                    {currentUser?.name}
                  </h3>
                  <p className="text-gray-500 text-center mb-4">
                    Software Engineer
                  </p>
                  <ul className="w-full mb-4">
                    <li className="flex justify-between py-3 border-b border-gray-100">
                      <b className="text-gray-700">
                        {t("header.user.followers")}
                      </b>
                      <span className="text-blue-600 font-medium">1,322</span>
                    </li>
                    <li className="flex justify-between py-3 border-b border-gray-100">
                      <b className="text-gray-700">
                        {t("views.user.following")}
                      </b>
                      <span className="text-blue-600 font-medium">543</span>
                    </li>
                    <li className="flex justify-between py-3">
                      <b className="text-gray-700">
                        {t("header.user.friends")}
                      </b>
                      <span className="text-blue-600 font-medium">13,287</span>
                    </li>
                  </ul>
                  <button className="w-full bg-blue-600 hover:bg-blue-700 text-white py-2 rounded shadow-md font-medium transition-colors">
                    {t("main.label.follow")}
                  </button>
                </div>
              </div>

              <div className="bg-white rounded-lg shadow-sm border border-gray-200">
                <div className="bg-blue-600 px-4 py-3 rounded-t-lg">
                  <h3 className="text-white font-medium text-lg">
                    {t("main.label.aboutMe")}
                  </h3>
                </div>
                <div className="p-4">
                  <strong className="text-gray-800 flex items-center mb-2">
                    <i className="fas fa-book mr-2 text-gray-400" />
                    {t("main.label.education")}
                  </strong>
                  <p className="text-gray-600 mb-4">
                    B.S. in Computer Science from the University of Tennessee at
                    Knoxville
                  </p>
                  <hr className="border-gray-200 mb-4" />
                  <strong className="text-gray-800 flex items-center mb-2">
                    <i className="fas fa-map-marker-alt mr-2 text-gray-400" />
                    {t("main.label.location")}
                  </strong>
                  <p className="text-gray-600 mb-4">Malibu, California</p>
                  <hr className="border-gray-200 mb-4" />
                  <strong className="text-gray-800 flex items-center mb-2">
                    <i className="fas fa-pencil-alt mr-2 text-gray-400" />
                    {t("main.label.skills")}
                  </strong>
                  <p className="text-gray-600 mb-4 flex flex-wrap gap-2">
                    <span className="px-2 py-1 bg-red-100 text-red-700 text-xs rounded font-medium">
                      UI Design
                    </span>
                    <span className="px-2 py-1 bg-green-100 text-green-700 text-xs rounded font-medium">
                      Coding
                    </span>
                    <span className="px-2 py-1 bg-cyan-100 text-cyan-700 text-xs rounded font-medium">
                      Javascript
                    </span>
                    <span className="px-2 py-1 bg-amber-100 text-amber-700 text-xs rounded font-medium">
                      PHP
                    </span>
                    <span className="px-2 py-1 bg-blue-100 text-blue-700 text-xs rounded font-medium">
                      Node.js
                    </span>
                  </p>
                  <hr className="border-gray-200 mb-4" />
                  <strong className="text-gray-800 flex items-center mb-2">
                    <i className="far fa-file-alt mr-2 text-gray-400" />
                    {t("main.label.notes")}
                  </strong>
                  <p className="text-gray-600">
                    Lorem ipsum dolor sit amet, consectetur adipiscing elit.
                    Etiam fermentum enim neque.
                  </p>
                </div>
              </div>
            </div>

            <div className="md:col-span-3">
              <div className="bg-white rounded-lg shadow-sm border border-gray-200">
                <div className="border-b border-gray-200 p-2">
                  <ul className="flex space-x-1">
                    <li>
                      <button
                        className={`px-4 py-2 rounded text-sm font-medium transition-colors ${
                          activeTab === "ACTIVITY"
                            ? "bg-blue-600 text-white shadow-sm"
                            : "hover:bg-gray-100 text-gray-600"
                        }`}
                        onClick={() => toggle("ACTIVITY")}
                      >
                        {t("main.label.activity")}
                      </button>
                    </li>
                    <li>
                      <button
                        className={`px-4 py-2 rounded text-sm font-medium transition-colors ${
                          activeTab === "TIMELINE"
                            ? "bg-blue-600 text-white shadow-sm"
                            : "hover:bg-gray-100 text-gray-600"
                        }`}
                        onClick={() => toggle("TIMELINE")}
                      >
                        {t("main.label.timeline")}
                      </button>
                    </li>
                    <li>
                      <button
                        className={`px-4 py-2 rounded text-sm font-medium transition-colors ${
                          activeTab === "SETTINGS"
                            ? "bg-blue-600 text-white shadow-sm"
                            : "hover:bg-gray-100 text-gray-600"
                        }`}
                        onClick={() => toggle("SETTINGS")}
                      >
                        {t("main.label.settings")}
                      </button>
                    </li>
                  </ul>
                </div>
                <div className="p-6">
                  <div>
                    <ActivityTab isActive={activeTab === "ACTIVITY"} />
                    <TimelineTab isActive={activeTab === "TIMELINE"} />
                    <SettingsTab isActive={activeTab === "SETTINGS"} />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </>
  );
};

export default Profile;

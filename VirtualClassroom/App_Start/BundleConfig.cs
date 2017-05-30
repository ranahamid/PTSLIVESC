using System.Web.Optimization;
using System.Web.Optimization.React;

namespace VirtualClassroom
{
    public class LessTransform : IBundleTransform
    {
        public void Process(BundleContext context, BundleResponse response)
        {
            response.Content = dotless.Core.Less.Parse(response.Content);
            response.ContentType = "text/css";
        }
    }

    public class BundleConfig
    {
        public static void RegisterBundles(BundleCollection bundles)
        {
            // jquery
            bundles.Add(new ScriptBundle("~/bundles/jquery").Include(
                        "~/Scripts/jquery-{version}.js"));

            bundles.Add(new ScriptBundle("~/bundles/bootstrap").Include(
                      "~/Scripts/bootstrap.js"));

            bundles.Add(new ScriptBundle("~/bundles/react").Include(
                        "~/Scripts/react.js",
                        "~/Scripts/react-dom.js"
                        ));

            /*
            bundles.Add(new StyleBundle("~/Content/css").Include("~/Content/bootstrap.css"));
            */

            // less styles
            var lessBundle = new LessBundle("~/Content/less").Include("~/Content/StyleSheet.less");
            lessBundle.Transforms.Add(new LessTransform());
            lessBundle.Transforms.Add(new CssMinify());
            bundles.Add(lessBundle);

            // global scripts
            bundles.Add(new BabelBundle("~/vc/global").Include(
                "~/Scripts/global/Data.js",
                "~/Scripts/global/components/Tabs.js",
                "~/Scripts/global/components/Selector.js"
                ));

            // forms - for TC, PC
            bundles.Add(new BabelBundle("~/vc/forms").Include(
                "~/Scripts/canvasjs.min.js",
                "~/Scripts/forms/components/Chart.js",
                "~/Scripts/forms/components/Component.js",
                "~/Scripts/forms/components/Component.Checkboxes.js",
                "~/Scripts/forms/components/Component.Label.js",
                "~/Scripts/forms/components/Component.Radiobuttons.js",
                "~/Scripts/forms/components/Component.Textbox.js",
                "~/Scripts/forms/Form.Panel.js",
                "~/Scripts/forms/Form.Body.js",
                "~/Scripts/forms/Form.js"
                ));

            // admin scripts
            bundles.Add(new BabelBundle("~/vc/admin").Include(
                "~/Scripts/admin/lists/Base.js",
                "~/Scripts/admin/lists/Classrooms.js",
                "~/Scripts/admin/lists/Seats.js",
                "~/Scripts/admin/lists/Teachers.js",
                "~/Scripts/admin/lists/Featureds.js",
                "~/Scripts/admin/lists/Students.js",
                "~/Scripts/admin/lists/Forms.js",
                "~/Scripts/admin/Administration.js"
                 
                ));

            // app scripts
            bundles.Add(new BabelBundle("~/vc/app").Include(
                "~/Scripts/app/global/Fce.js",
                "~/Scripts/app/global/Interfaces.js",
                "~/Scripts/app/global/Signaling.js",
                "~/Scripts/app/components/Volume.js",
                "~/Scripts/app/components/SwitchButton.js",
                "~/Scripts/app/components/Status.js",
                "~/Scripts/app/components/Box.js",
                "~/Scripts/app/components/BoxLabel.js",
                "~/Scripts/app/components/Audio.js",
                "~/Scripts/app/components/Chat.js",
                "~/Scripts/app/XC.js"
                ));

            bundles.Add(new BabelBundle("~/vc/app/SC").Include("~/Scripts/app/SC.js"));

            bundles.Add(new BabelBundle("~/vc/app/PC").Include(
                // "~/Scripts/app/pc/FormsPc.js",
                "~/Scripts/app/PC.js"
                ));

            bundles.Add(new BabelBundle("~/vc/app/Moderator").Include(
               // "~/Scripts/app/pc/FormsPc.js",
               "~/Scripts/app/Moderator.js"
               ));

            bundles.Add(new BabelBundle("~/vc/app/PC2").Include(
                "~/Scripts/app/pc/FormsPc.js",
                "~/Scripts/app/PC2.js"
                ));
            bundles.Add(new BabelBundle("~/vc/app/TC").Include(
                "~/Scripts/app/tc/FormsTc.js",
                "~/Scripts/app/TC.js"
                ));
            bundles.Add(new BabelBundle("~/vc/app/FC").Include("~/Scripts/app/FC.js"));

            bundles.Add(new BabelBundle("~/vc/app/AC").Include(
                "~/Scripts/app/ac/ComputersList.js",
                "~/Scripts/app/ac/FeaturedBox.js",
                "~/Scripts/app/AC.js"
                ));

            BundleTable.EnableOptimizations = true;
        }
    }
}

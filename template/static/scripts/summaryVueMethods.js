vueMethods = {
    updateMinDate: function(date) {
        this.minDate = date;
    },
    updateMaxDate: function(date) {
        this.maxDate = date;
    },
    rangeFilter: function(contributions, minDate, maxDate) {
        var resultContribution = [];
        var minDateParsed = Date.parse(minDate);
        var maxDateParsed = Date.parse(maxDate);
        for (contribution of contributions) {
            var currentFromDate = Date.parse(contribution["fromDate"]);
            var currentToDate = Date.parse(contribution["toDate"]);
            if (minDateParsed.compareTo(currentFromDate) <= 0 && maxDateParsed.compareTo(currentToDate) >= 0) {
                resultContribution.push(contribution);
            }
        }
        return resultContribution;
    },
    getSliceStyle: function(index, value, intervalType, minDate, maxDate) {
        var sliceScaleLimit = sliceScaleLimitMap[intervalType];
        var spacing = 93 / getIntervalCount(intervalType, minDate, maxDate);
        var contribution = value['insertions'];
        var width;
        if (contribution == 0) {
            width = 0;
        } else if (contribution > sliceScaleLimit) {
            width = spacing * 1.5;
        } else {
            width = contribution / sliceScaleLimit * spacing * 1.5;
            if (width < 0.5) {
                width = 0.5;
            }
        }
        var color = rgbacolors[index % (rgbacolors.length)];
        return "margin-left:" + (index * spacing - width + spacing) + "%;" + "width:" + width + "%;" + "background: linear-gradient(to left top, " + color + " 50%, transparent 50%);" + ";";
    },
    getContributionBarWidths: function(value) {
        var widths = [];
        for (var i = 0; i < parseInt(value / totalContributionLimit); i++) {
            widths.push("100%");
        }
        widths.push((value % totalContributionLimit) / totalContributionLimit * 100 + "%");
        return widths;
    },
    getSliceTitle: function(value) {
        return "contribution from " + value["fromDate"] + " to " + value["toDate"] + ": " + value['insertions'] + " lines";
    },
    getSliceGithubLink: function(timeSlice, authorRepo) {
        var url = "https://github.com/" +
            authorRepo.organization + "/" + authorRepo.repo +
            "/commits/" + authorRepo["branch"] +
            "?author=" + authorRepo["author"] + "&since=" +
            timeSlice["fromDate"] + "&until=" + timeSlice["toDate"];
        return "openInNewTab('" + url + "')";
    },
    getContributionBarTitle: function(value) {
        return "total contribution : " + value;
    },
    sortAndFilter: function(summary, searchTerm, sortElement, sortOrder, isGroupByRepo) {
        authorRepos = [];
        for (repo in summary) {
            newRepo = [];
            for (author in summary[repo]['authorFinalContributionMap']) {
                authorRepo = {};
                authorRepo['author'] = author;
                authorRepo['authorDisplayName'] = summary[repo]['authorDisplayNameMap'][author];
                authorRepo['displayName'] = summary[repo]['displayName'];
                authorRepo['repo'] = summary[repo]['repo'];
                authorRepo['branch'] = summary[repo]['branch'];
                authorRepo['organization'] = summary[repo]['organization'];
                authorRepo['authorDailyIntervalContributions'] = summary[repo]['authorDailyIntervalContributions'][author];
                authorRepo['authorWeeklyIntervalContributions'] = summary[repo]['authorWeeklyIntervalContributions'][author];
                authorRepo['finalContribution'] = summary[repo]['authorFinalContributionMap'][author];
                authorRepo['variance'] = summary[repo]['authorContributionVariance'][author];
                if (isSearchMatch(searchTerm, authorRepo)) {
                    newRepo.push(authorRepo);
                }
            }
            authorRepos.push(newRepo);
        }
        if (isGroupByRepo == true) {
            for (repoIndex in authorRepos) {
                authorRepos[repoIndex] = sortSegment(authorRepos[repoIndex], sortElement, sortOrder);
            }
            authorRepos = flatten(authorRepos);
        } else {
            authorRepos = flatten(authorRepos);
            sortSegment(authorRepos, sortElement, sortOrder);
        }
        return authorRepos;

    }
}